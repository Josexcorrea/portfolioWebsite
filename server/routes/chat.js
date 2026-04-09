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

  function extractFilePath(raw) {
    const m = String(raw || '').match(/\bFile:\s*([^\n]+)/i)
    return m ? m[1].trim() : null
  }

  function extractRelevantSnippet(raw) {
    const text = String(raw || '')
    if (!text) return ''
    const exportIdx = text.search(/\bexport function\b/i)
    if (exportIdx >= 0) {
      const start = Math.max(0, exportIdx - 200)
      const end = Math.min(text.length, exportIdx + 700)
      return text.slice(start, end).trim()
    }
    const hookIdx = text.search(/\buse[A-Z][A-Za-z0-9_]*\s*\(/)
    if (hookIdx >= 0) {
      const start = Math.max(0, hookIdx - 180)
      const end = Math.min(text.length, hookIdx + 680)
      return text.slice(start, end).trim()
    }
    return text.slice(0, 900).trim()
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
  const fileMatch = text.match(/FileHint:\s*([^\n]+)/)
  const codeMatch = text.match(/```([\s\S]*?)```/)
  if (!fileMatch || !codeMatch) return null
  const file = fileMatch[1].trim()
  const code = codeMatch[1].trim()
  if (!file || !code) return null
  return { file, code }
}

function ownerSnippetFallbackAnswer(snippetEvidence) {
  const picked = firstSnippetFromEvidence(snippetEvidence)
  if (!picked) return null
  return `Client-ready script
I pulled the exact implementation from your indexed repo context, so let’s use the real function instead of a generic example. This snippet is the core piece to discuss in interviews because it shows the actual data/query flow in your project.

---

## Cheat sheet
### Snippet
File: \`${picked.file}\`
\`\`\`
${picked.code}
\`\`\`

### What it does
This function/hook wraps one focused behavior and returns the value your UI uses.

### Line-by-line breakdown
- Import lines: bring in required query/API utilities and types.
- \`export function ...\`: defines the reusable function/hook entry point.
- Return block: executes the query/call and provides configured behavior.
- Query key/endpoint/options lines: control cache identity, request target, and freshness/behavior.

### Why it matters
This is the operational source of truth for that feature, so using this exact snippet keeps answers grounded and useful for debugging.
`
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
      (looksLikeFreshnessOrGeneralWebQuery(qLower) || !looksLikePortfolioScopedQuestion(qLower))
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

    const tail = formatter.flush()
    if (tail) writeNdjson(res, { type: 'delta', content: tail })

    if (ownerMode && snippetRequested && codeEvidenceStrong && !/```/.test(fullAnswer)) {
      const fallback = ownerSnippetFallbackAnswer(snippetEvidence)
      if (fallback) {
        writeNdjson(res, { type: 'delta', content: '\n\n' + fallback })
      }
    }

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

