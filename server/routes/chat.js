import express from 'express'
import { writeNdjson } from '../lib/ndjson.js'
import { parseOwnerPrefix } from '../lib/ownerPrefix.js'
import { getRagContext } from '../services/rag.js'
import { searchWeb } from '../services/webSearch.js'
import { generateBlocks, shouldGenerateExampleBlocks } from '../services/blocks.js'
import { sanitizeMessages } from '../services/sanitizeMessages.js'
import { createStreamMathFormatter } from '../lib/streamMathFormatter.js'
import {
  buildOwnerContractInstruction,
  hasStrongCodeEvidence,
  isDetailTechnicalQuestion,
  looksLikeFreshnessOrGeneralWebQuery,
  looksLikePortfolioScopedQuestion,
  looksLikeRiskOrSecurityQuestion,
  looksLikeSnippetRequest,
  looksLikeThisPortfolioMetaQuestion,
  shouldRunWebSearch,
} from '../lib/chatPolicies.js'

function safeClientError(status) {
  if (status === 400) return 'Invalid chat request.'
  if (status === 401 || status === 403) return 'Request is not authorized.'
  if (status === 404) return 'Requested resource was not found.'
  if (status === 408) return 'Request timed out. Please try again.'
  if (status === 429) return 'Too many requests. Try again in a minute.'
  return 'Failed to get response. Try again later.'
}

function buildSnippetEvidence(chunks, qLower) {
  if (!Array.isArray(chunks) || chunks.length === 0) return ''
  const q = String(qLower || '').toLowerCase()
  const terms = Array.from(
    new Set(
      q
        .split(/[^a-z0-9+]+/g)
        .filter((t) => t.length >= 3),
    ),
  )

  function sanitizeFileHint(rawHint) {
    const hint = String(rawHint || '').trim()
    if (!hint) return ''

    const githubPathMatch = hint.match(/\/blob\/(?:main|master)\/([A-Za-z0-9._/-]+\.[A-Za-z0-9]+)/)
    if (githubPathMatch?.[1]) return githubPathMatch[1]

    const dashedPathMatch = hint.match(/—\s*([A-Za-z0-9._/-]+\.[A-Za-z0-9]+)/)
    if (dashedPathMatch?.[1]) return dashedPathMatch[1]

    const plainPathMatch = hint.match(/\b([A-Za-z0-9._/-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|go|java|rs|json|md|yml|yaml))\b/)
    if (plainPathMatch?.[1]) return plainPathMatch[1]

    return hint
      .split(/\s+(?:Source:|Repository:|Branch:|import|export|const|function|interface)\b/i)[0]
      .trim()
  }

  function extractFilePath(raw) {
    const m = String(raw || '').match(/\bFile:\s*([^\n]+)/i)
    return m ? sanitizeFileHint(m[1]) : null
  }

  function extractRelevantSnippet(raw) {
    const text = String(raw || '')
    if (!text) return ''
    const fenced = text.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/)
    if (fenced?.[1]) return fenced[1].trim()

    const lines = text.split('\n')
    if (lines.length === 0) return ''

    const anchorRegexes = [
      /\bexport\s+(async\s+)?function\b/,
      /\bexport\s+const\b/,
      /\bfunction\s+[A-Za-z0-9_]+\s*\(/,
      /\buse[A-Z][A-Za-z0-9_]*\s*\(/,
    ]
    const anchor = lines.findIndex((line) => anchorRegexes.some((rx) => rx.test(line)))
    const start = Math.max(0, (anchor >= 0 ? anchor : 0) - 4)

    // Prefer complete logical blocks over fixed character slices.
    let end = Math.min(lines.length, start + 80)
    if (anchor >= 0) {
      let braceDepth = 0
      let opened = false
      for (let i = anchor; i < Math.min(lines.length, anchor + 120); i++) {
        const line = lines[i]
        for (const ch of line) {
          if (ch === '{') {
            braceDepth++
            opened = true
          }
          if (ch === '}' && braceDepth > 0) braceDepth--
        }
        end = Math.max(end, i + 1)
        if (opened && braceDepth === 0 && i > anchor + 3) break
      }
    }

    return lines
      .slice(start, end)
      .join('\n')
      .trim()
  }

  const scored = chunks
    .map((c) => {
      const title = String(c.documentTitle || '')
      const body = String(c.chunkText || '')
      const bag = `${title}\n${body}`.toLowerCase()
      const filePath = extractFilePath(body) || title
      let score = 0
      if (bag.includes('sports-card')) score += 6
      if (bag.includes('calculations.py') || bag.includes('calculations.ts')) score += 4
      if (bag.includes('ev') || bag.includes('expected value')) score += 3
      if (q.includes('shelfos') && bag.includes('shelfos')) score += 8
      if (q.includes('hook') && /\/hooks\/|hooks?/.test(bag)) score += 10
      if (/export function/.test(bag)) score += 10
      if (/package\.json|readme\.md/.test(bag)) score -= 8
      for (const t of terms) {
        if (bag.includes(t)) score += 1
      }
      return { c, score, filePath, snippet: extractRelevantSnippet(body) }
    })
    .filter((x) => x.score > -3 && x.snippet)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const lines = []
  for (let i = 0; i < scored.length; i++) {
    const { c, filePath, snippet } = scored[i]
    lines.push(
      `### Evidence ${i + 1}\nTitle: ${c.documentTitle}\nFileHint: ${filePath}\nSnippet:\n\`\`\`\n${snippet}\n\`\`\``,
    )
  }
  return lines.join('\n\n')
}

function firstSnippetFromEvidence(snippetEvidence) {
  const text = String(snippetEvidence || '')
  if (!text) return null

  const sections = text
    .split(/\n### Evidence \d+\n/g)
    .map((s) => s.trim())
    .filter(Boolean)

  const scored = sections
    .map((section) => {
      const fileMatch = section.match(/FileHint:\s*([^\n]+)/)
      const blocks = Array.from(section.matchAll(/```([\s\S]*?)```/g)).map((m) => String(m[1] || '').trim())
      const bestBlock = blocks
        .map((b) => {
          const codeLikeHits =
            (b.match(/\b(function|const|let|return|if|for|map|reduce|async|await|=>)\b/g) || []).length
          const score = b.length + codeLikeHits * 80 - (/\bgithub:|file:/i.test(b) ? 140 : 0)
          return { b, score }
        })
        .sort((a, b) => b.score - a.score)[0]
      return {
        file: fileMatch?.[1]?.trim() || '',
        code: bestBlock?.b || '',
        score: bestBlock?.score || -1,
      }
    })
    .filter((x) => x.file && x.code)
    .sort((a, b) => b.score - a.score)

  if (!scored[0]) return null
  const chosen = scored[0]
  const looksCodeLike =
    chosen.code.length >= 80 &&
    /\b(function|const|let|return|if|for|map|reduce|async|await|=>|class|export|import)\b/.test(chosen.code)
  if (!looksCodeLike) return null
  return { file: chosen.file, code: chosen.code }
}

function firstSnippetFromContext(contextText) {
  const text = String(contextText || '')
  if (!text) return null
  const lines = text.split('\n')
  const anchor = lines.findIndex((line) =>
    /\bexport\s+(async\s+)?function\b|\bexport\s+const\b|\bfunction\s+[A-Za-z0-9_]+\s*\(/.test(line),
  )
  if (anchor < 0) return null

  const start = Math.max(0, anchor - 4)
  const end = Math.min(lines.length, anchor + 60)
  const code = lines.slice(start, end).join('\n').trim()
  const looksCodeLike =
    code.length >= 80 &&
    /\b(function|const|let|return|if|for|map|reduce|async|await|=>|class|export|import)\b/.test(code)
  if (!looksCodeLike) return null

  let file = 'retrieved context'
  for (let i = anchor; i >= Math.max(0, anchor - 20); i--) {
    const m = lines[i].match(/\b(?:FileHint|File|Title):\s*([^\n]+)/)
    if (m?.[1]) {
      file = m[1].trim()
      break
    }
  }
  return { file, code }
}

function explainCodeLine(line) {
  const trimmed = String(line || '').trim()
  if (!trimmed) return 'Blank line for readability.'
  if (/^\/\//.test(trimmed)) return 'Comment describing intent or constraints for the next logic.'
  if (/^import\s+/.test(trimmed)) return 'Imports a dependency used by this function.'
  if (/^export\s+(async\s+)?function\s+/.test(trimmed)) return 'Declares the exported function entry point.'
  if (/^(const|let)\s+/.test(trimmed)) return 'Creates a local variable used in the computation.'
  if (/^if\s*\(/.test(trimmed)) return 'Guard/branch: changes behavior based on a condition.'
  if (/^return\b/.test(trimmed)) return 'Returns the computed value to the caller.'
  if (/=>/.test(trimmed)) return 'Defines inline callback logic for transformation/iteration.'
  return 'Performs one step in the core algorithm flow.'
}

function normalizeSnippetForDisplay(code) {
  const raw = String(code || '').trim()
  if (!raw) return ''
  const noFences = raw.replace(/```/g, '').trim()
  const withoutMeta = noFences
    .replace(/^(Repository|Source|FileHint|File|Branch)\s*:[^\n]*\n?/gim, '')
    .trim()
  if (withoutMeta.includes('\n')) return withoutMeta
  if (withoutMeta.length < 180) return withoutMeta

  // If retrieval returned compressed one-line code, restore readable newlines.
  return withoutMeta
    .replace(/;\s*/g, ';\n')
    .replace(/\{\s*/g, '{\n')
    .replace(/\}\s*/g, '}\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildLineByLine(code, maxLines = 16) {
  const normalized = normalizeSnippetForDisplay(code)
  const lines = normalized.split('\n').map((line) => line.trimEnd())
  const shown = lines.slice(0, maxLines)
  const items = shown.map((line, idx) => {
    const n = idx + 1
    const compact = (line || '(blank)').slice(0, 140)
    return `- Line ${n}: \`${compact}\`\n  - ${explainCodeLine(line)}`
  })
  if (lines.length > maxLines) {
    items.push(
      `- Remaining lines: snippet has ${lines.length - maxLines} additional lines continuing the same logic.`,
    )
  }
  return items.join('\n')
}

function ownerSnippetFallbackAnswer(snippetEvidence, contextText) {
  const picked = firstSnippetFromEvidence(snippetEvidence) || firstSnippetFromContext(contextText)
  if (!picked) return null
  const code = normalizeSnippetForDisplay(picked.code)
  const usableCode =
    code.length >= 80 &&
    (/\b(function|const|let|return|if|for|map|reduce|async|await|=>|class|export|import)\b/.test(code) ||
      /[{}();=>]/.test(code))
  if (!usableCode) return null
  const lineByLine = buildLineByLine(code)
  const fnNameMatch = code.match(
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)|\b(?:const|let)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(/,
  )
  const fnName = fnNameMatch?.[1] || fnNameMatch?.[2] || 'this function'
  const flowHints = [
    /\bmap\s*\(/.test(code) ? 'transforms input arrays with `map`' : null,
    /\breduce\s*\(/.test(code) ? 'aggregates values with `reduce`' : null,
    /\bif\s*\(/.test(code) ? 'uses guard conditions for branch logic' : null,
    /\breturn\b/.test(code) ? 'returns computed results for UI/business use' : null,
  ].filter(Boolean)
  const flowLine = flowHints.length
    ? `In this snippet, ${flowHints.slice(0, 2).join(' and ')}.`
    : 'The snippet shows a concrete compute flow that turns inputs into output decisions.'
  return `Client-ready script
This is the strongest exact snippet available from retrieved repo context, centered on \`${fnName}\`. Use this as your interview anchor: it shows the real compute flow, not a generic example. ${flowLine} A practical tradeoff here is readability versus compactness when logic gets dense, so explain why each step is separated and testable.

---

## Cheat sheet
### Snippet
File: \`${picked.file}\`
\`\`\`
${code}
\`\`\`

### What it does
This function is part of your real project logic and is shown directly from retrieved code context.

### Line-by-line breakdown
${lineByLine}

### Why it matters
Using the exact snippet keeps your explanation grounded, debuggable, and credible for technical Q&A.
`
}

function hasContradictorySnippetAnswer(answer) {
  const text = String(answer || '')
  const hasCannot = text.includes('I cannot show the exact snippet from retrieved context for this request.')
  const hasCodeBlock = /```[\s\S]+```/.test(text)
  return hasCannot && hasCodeBlock
}

function normalizeOwnerSnippetAnswer(answer, { codeEvidenceStrong }) {
  let text = String(answer || '').trim()
  if (!text) return text
  if (codeEvidenceStrong) {
    text = text.replace(/I cannot show the exact snippet from retrieved context for this request\./g, '').trim()
  }
  text = normalizeOwnerSupportHeading(text)
  return text
}

function inferSupportHeading(sectionText) {
  const s = String(sectionText || '')
  if (/```[\s\S]*?```/.test(s) || /(^|\n)\s*(import|export|const|let|function)\b/.test(s)) return 'Code'
  if (/```mermaid/.test(s) || /\b(diagram|flow|sequence)\b/i.test(s)) return 'Diagram'
  if (/\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\(|\\\[|\b(equation|formula|rule)\b/i.test(s)) return 'Equation'
  return 'Diagram'
}

function normalizeOwnerSupportHeading(text) {
  const source = String(text || '')
  const rx = /(^|\n)(#{1,6}\s*)?(Part\s*3\s*[—-]\s*)?Visual Aid\s*:?\s*(\n|$)/i
  const m = source.match(rx)
  if (!m || typeof m.index !== 'number') return source

  const matchStart = m.index
  const matchEnd = matchStart + m[0].length
  const after = source.slice(matchEnd)
  const nextHeadingIdx = after.search(/\n#{1,6}\s+/)
  const sectionBody = nextHeadingIdx >= 0 ? after.slice(0, nextHeadingIdx) : after
  const title = inferSupportHeading(sectionBody)
  const prefix = m[1] || ''
  const hashes = m[2] || '### '

  const normalizedHeading = `${prefix}${hashes}${title}\n`
  return source.slice(0, matchStart) + normalizedHeading + after.replace(/^\n+/, '')
}

/**
 * Shared by Express (`createChatRouter`) and Vercel (`api/chat.js`).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function executeChatPost(req, res, { openai, config, store }) {
  const rawMessages = req.body?.messages
  const requestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Server not configured: OPENAI_API_KEY is missing.',
    })
  }

  const messages = sanitizeMessages(rawMessages)
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required and must not be empty.' })
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const lastQuestion = lastUser?.content?.trim()
  if (!lastQuestion) {
    return res.status(400).json({ error: 'Last message must be from user with content.' })
  }

  const { ownerMode, questionForRag } = parseOwnerPrefix(lastQuestion)
  if (ownerMode && !questionForRag.trim()) {
    return res.status(400).json({
      error: 'Add your question after the owner prefix.',
    })
  }

  try {
    const qLower = questionForRag.toLowerCase()
    const isWhoOrCollabQuestion =
      /\bwho\b/.test(qLower) ||
      qLower.includes('worked with') ||
      qLower.includes('worked on') ||
      qLower.includes('collaborat') ||
      qLower.includes('power distribution') ||
      qLower.includes('pdm')

    const wantsDetail = isDetailTechnicalQuestion(qLower)
    const snippetRequested = looksLikeSnippetRequest(qLower)

    let ragTopK = config.RAG_TOP_K
    if (isWhoOrCollabQuestion) ragTopK = Math.max(ragTopK, 5)
    if (wantsDetail || ownerMode) ragTopK = Math.max(ragTopK, config.RAG_TOP_K_DETAIL ?? 8)
    if (ownerMode) {
      ragTopK = Math.min(20, Math.max(ragTopK, (config.RAG_TOP_K_DETAIL ?? 12) + 2))
    }

    let ragMinScore = config.RAG_MIN_SCORE
    if (isWhoOrCollabQuestion) ragMinScore = Math.min(ragMinScore, 0.62)
    if (wantsDetail || ownerMode) {
      const detailFloor =
        typeof config.RAG_MIN_SCORE_DETAIL === 'number' ? config.RAG_MIN_SCORE_DETAIL : 0.18
      ragMinScore = Math.min(ragMinScore, detailFloor)
    }
    if (ownerMode) {
      ragMinScore = Math.min(ragMinScore, 0.12)
    }

    let { chunks, context, maxScore } = await getRagContext({
      question: questionForRag,
      openai,
      store,
      topK: ragTopK,
      minScore: ragMinScore,
    })

    // Owner snippet requests get a second retrieval pass when first-pass
    // evidence does not look code-grounded enough.
    if (ownerMode && snippetRequested && !hasStrongCodeEvidence(chunks)) {
      const secondPass = await getRagContext({
        question: `${questionForRag}\nshow source code implementation file path export function`,
        openai,
        store,
        topK: Math.min(28, ragTopK + 8),
        minScore: Math.min(ragMinScore, 0.08),
      })
      if (hasStrongCodeEvidence(secondPass.chunks) || secondPass.maxScore > maxScore) {
        chunks = secondPass.chunks
        context = secondPass.context
        maxScore = secondPass.maxScore
      }
    }

    // Deterministic "solo fallback" for non-PDM collaborator questions:
    // if the retrieved context doesn't appear to contain any "worked with/collaborated with <Name>" pattern,
    // treat it as solo work for that project (per your requirement).
    const isWorkWithQuestion =
      qLower.includes('work with') || qLower.includes('worked with') || qLower.includes('collaborat')
    const isPdmQuestion =
      qLower.includes('power distribution module') || qLower.includes('power distribution') || qLower.includes('pdm')

    function titleTokens(title) {
      const raw = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')
      const parts = raw.split(/\s+/).filter(Boolean)
      return Array.from(new Set(parts.filter((t) => t.length >= 4 && t !== 'jose' && t !== 'correa')))
    }

    // Only consider collaborator-name signals in chunks that look relevant to the project being asked about.
    // This prevents PDM collaborator names from affecting other projects (like your Netflix question).
    const relevantChunks = chunks.filter((c) => {
      const tokens = titleTokens(c.documentTitle)
      if (tokens.length === 0) return false
      return tokens.some((t) => qLower.includes(t))
    })

    const collaboratorSignalText = relevantChunks.length
      ? relevantChunks.map((c) => c.chunkText).join('\n\n---\n\n')
      : context

    const looksLikeCollaboratorName =
      /\b(worked with|collaborated with)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/.test(collaboratorSignalText) ||
      /\bwith\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/.test(collaboratorSignalText)

    if (isWorkWithQuestion && !isPdmQuestion && !looksLikeCollaboratorName) {
      const soloAnswer =
        "To my understanding, Jose built this one solo — no collaborators are listed for this project."

      res.setHeader('Content-Type', 'application/x-ndjson')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()

      writeNdjson(res, { type: 'delta', content: soloAnswer })
      writeNdjson(res, { type: 'done' })
      res.end()
      console.log(JSON.stringify({ requestId, route: '/api/chat', ok: true, ragChunks: chunks.length, soloFallback: true }))
      return
    }

    if (
      looksLikeFreshnessOrGeneralWebQuery(qLower) &&
      !process.env.TAVILY_API_KEY
    ) {
      console.log(
        JSON.stringify({
          requestId,
          route: '/api/chat',
          webSearchSkipped: 'no_tavily_key',
          freshOrWebQuery: true,
        }),
      )
    }

    const webWanted = shouldRunWebSearch(questionForRag, {
      maxScore,
      chunksLen: chunks.length,
    })
    const webResults = webWanted
      ? await searchWeb(questionForRag, {
          weakRag: maxScore < 0.28 && chunks.length < 2,
        })
      : null

    if (webWanted && (!webResults || webResults.length === 0)) {
      console.log(
        JSON.stringify({
          requestId,
          route: '/api/chat',
          webSearchTriedNoResults: true,
        }),
      )
    }
    let webContext = ''
    if (webResults && webResults.length > 0) {
      webContext = webResults
        .map((r) => `Title: ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
        .join('\n\n---\n\n')
    }
    const webSearchUnavailable =
      !process.env.TAVILY_API_KEY &&
      !looksLikeThisPortfolioMetaQuestion(qLower) &&
      (looksLikeFreshnessOrGeneralWebQuery(qLower) || !looksLikePortfolioScopedQuestion(qLower)) &&
      !webContext
    const webNoResults = webWanted && (!webResults || webResults.length === 0)

    const securityStyleQuestion = looksLikeRiskOrSecurityQuestion(qLower)
    const codeEvidenceStrong = hasStrongCodeEvidence(chunks)
    const snippetEvidence = snippetRequested && codeEvidenceStrong ? buildSnippetEvidence(chunks, qLower) : ''

    let systemContent = config.systemPromptBase
    if (wantsDetail && config.systemPromptDetailMode) {
      systemContent += `\n\n${config.systemPromptDetailMode}`
    }
    if (ownerMode && config.systemPromptOwnerMode) {
      systemContent += `\n\n${config.systemPromptOwnerMode}`
      systemContent += `\n\n${buildOwnerContractInstruction({
        snippetRequested,
        securityStyleQuestion,
        codeEvidenceStrong,
      })}`
      if (snippetRequested && codeEvidenceStrong) {
        systemContent += `\n\n## Required output shape for this turn\n- In Part 2 (Cheat sheet), start with **Snippet**.\n- Under **Snippet**, include:\n  - File: <best-matching path/title>\n  - A fenced code block copied from retrieved evidence.\n- Immediately after snippet, include **Line-by-line breakdown**:\n  - explain what each shown line or logical code block does,\n  - explain why each part matters for behavior.\n- Keep Part 1 script short and non-repetitive; put deep technical detail in Part 2.\n`
      }
      if (snippetRequested && !codeEvidenceStrong) {
        systemContent += `\n\n## Required output shape for missing exact code\n- Say exactly: "I cannot show the exact snippet from retrieved context for this request."\n- Then list nearest retrieved file/path evidence.\n- Do not invent code or pseudocode.\n`
      }
      if (snippetEvidence) {
        systemContent += `\n\n## Retrieved code evidence\nUse these excerpts for the Snippet section. Quote short portions faithfully and mention file titles.\n\n${snippetEvidence}`
      }
    }
    if (webContext) systemContent += `\n\n## Web search results\n${webContext}`
    if (webSearchUnavailable || webNoResults) {
      systemContent += `\n\n## Web fallback status\nNo usable web research results are available for this turn. Do a best-effort answer from portfolio context and general knowledge, clearly separate known facts from assumptions, and keep the explanation practical for non-engineers.`
    }
    systemContent += `\n\n## Portfolio context\n${context}`

    const messagesForModel =
      ownerMode && messages.length > 0
        ? (() => {
            const lastIdx = messages.length - 1
            const last = messages[lastIdx]
            if (last.role !== 'user') return messages
            return [
              ...messages.slice(0, lastIdx),
              { ...last, content: questionForRag },
            ]
          })()
        : messages

    const apiMessages = [{ role: 'system', content: systemContent }, ...messagesForModel]

    let maxTokens =
      wantsDetail || ownerMode
        ? config.MAX_COMPLETION_TOKENS_DETAIL
        : config.MAX_COMPLETION_TOKENS
    if (!wantsDetail && !ownerMode && chunks.length > 0) {
      const floor =
        typeof config.MAX_COMPLETION_TOKENS_WITH_RAG === 'number'
          ? config.MAX_COMPLETION_TOKENS_WITH_RAG
          : 384
      maxTokens = Math.max(maxTokens, floor)
    }

    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    let fullAnswer = ''
    const formatter = createStreamMathFormatter()
    if (ownerMode && snippetRequested) {
      const completion = await openai.chat.completions.create({
        model: config.CHAT_MODEL,
        messages: apiMessages,
        max_tokens: maxTokens,
        stream: false,
      })
      fullAnswer = String(completion.choices?.[0]?.message?.content || '')
      fullAnswer = normalizeOwnerSnippetAnswer(fullAnswer, { codeEvidenceStrong })

      const missingRequiredCode = codeEvidenceStrong && !/```[\s\S]+```/.test(fullAnswer)
      if (hasContradictorySnippetAnswer(fullAnswer) || missingRequiredCode) {
        const fallback = ownerSnippetFallbackAnswer(snippetEvidence, context)
        if (fallback) fullAnswer = fallback
      }

      const formatted = formatter.push(fullAnswer)
      if (formatted) writeNdjson(res, { type: 'delta', content: formatted })
    } else {
      const stream = await openai.chat.completions.create({
        model: config.CHAT_MODEL,
        messages: apiMessages,
        max_tokens: maxTokens,
        stream: true,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullAnswer += delta
          const formatted = formatter.push(delta)
          if (formatted) writeNdjson(res, { type: 'delta', content: formatted })
        }
      }
    }

    const tail = formatter.flush()
    if (tail) writeNdjson(res, { type: 'delta', content: tail })

    const allowBlocks =
      shouldGenerateExampleBlocks(questionForRag) &&
      !(ownerMode && snippetRequested)

    if (allowBlocks) {
      const blocks = await generateBlocks({
        question: questionForRag,
        answer: fullAnswer,
        openaiClient: openai,
        model: config.CHAT_MODEL,
      })
      if (Array.isArray(blocks) && blocks.length > 0) {
        writeNdjson(res, { type: 'blocks', blocks })
      }
    }

    writeNdjson(res, { type: 'done' })
    res.end()

    console.log(
      JSON.stringify({
        requestId,
        route: '/api/chat',
        ok: true,
        ragChunks: chunks.length,
        ragMaxScore: maxScore,
        webSearch: Boolean(webResults?.length),
        detailMode: wantsDetail,
        ownerMode,
        ownerSnippetRequested: ownerMode ? snippetRequested : false,
        ownerCodeEvidenceStrong: ownerMode ? codeEvidenceStrong : false,
        maxTokens,
      }),
    )
  } catch (err) {
    console.error('Chat error:', requestId, err)
    if (!res.headersSent) {
      const status = err?.status || 500
      const message = safeClientError(status)
      res.status(status).json({ error: message })
    } else {
      writeNdjson(res, { type: 'error', error: 'Stream error' })
      res.end()
    }
  }
}

export function createChatRouter({
  chatLimiter,
  openai,
  config,
  store,
}) {
  const router = express.Router()

  router.post('/chat', chatLimiter, (req, res) => executeChatPost(req, res, { openai, config, store }))

  return router
}

