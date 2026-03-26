import express from 'express'
import { writeNdjson } from '../lib/ndjson.js'
import { getRagContext } from '../services/rag.js'
import { searchWeb } from '../services/webSearch.js'
import { generateBlocks, shouldGenerateExampleBlocks } from '../services/blocks.js'
import { sanitizeMessages } from '../services/sanitizeMessages.js'
import { createStreamMathFormatter } from '../lib/streamMathFormatter.js'

/** User wants depth: more RAG chunks + higher max_tokens (see createServer config). */
function isDetailTechnicalQuestion(qLower) {
  const patterns = [
    /\bin[- ]depth\b/,
    /\bdeep dive\b/,
    /\bmore detail\b/,
    /\bdetailed (answer|explanation|overview)\b/,
    /\btechnical (details|detail|explanation|overview|question)\b/,
    /\barchitecture\b/,
    /\bimplementation\b/,
    /\belaborate\b/,
    /\bwalk ?through\b/,
    /\bstep[- ]by[- ]step\b/,
    /\bexplain (how|why)\b/,
    /\bhow does (the )?.+\b(work|function)\b/,
    /\bthoroughly\b/,
    /\bcomprehensive\b/,
    /\bdesign (details|choices|decisions)\b/,
    /\bgo (into|in) detail\b/,
  ]
  return patterns.some((p) => p.test(qLower))
}

export function createChatRouter({
  chatLimiter,
  openai,
  config,
  store,
}) {
  const router = express.Router()

  router.post('/chat', chatLimiter, async (req, res) => {
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

    try {
      const qLower = lastQuestion.toLowerCase()
      const isWhoOrCollabQuestion =
        /\bwho\b/.test(qLower) ||
        qLower.includes('worked with') ||
        qLower.includes('worked on') ||
        qLower.includes('collaborat') ||
        qLower.includes('power distribution') ||
        qLower.includes('pdm')

      const wantsDetail = isDetailTechnicalQuestion(qLower)

      let ragTopK = config.RAG_TOP_K
      if (isWhoOrCollabQuestion) ragTopK = Math.max(ragTopK, 5)
      if (wantsDetail) ragTopK = Math.max(ragTopK, config.RAG_TOP_K_DETAIL ?? 8)

      let ragMinScore = config.RAG_MIN_SCORE
      if (isWhoOrCollabQuestion) ragMinScore = Math.min(ragMinScore, 0.62)
      if (wantsDetail) {
        const detailFloor =
          typeof config.RAG_MIN_SCORE_DETAIL === 'number' ? config.RAG_MIN_SCORE_DETAIL : 0.18
        ragMinScore = Math.min(ragMinScore, detailFloor)
      }

      const { chunks, context } = await getRagContext({
        question: lastQuestion,
        openai,
        store,
        topK: ragTopK,
        minScore: ragMinScore,
      })

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

      const webResults = await searchWeb(lastQuestion)
      let webContext = ''
      if (webResults && webResults.length > 0) {
        webContext = webResults
          .map((r) => `Title: ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
          .join('\n\n---\n\n')
      }

      let systemContent = config.systemPromptBase
      if (wantsDetail && config.systemPromptDetailMode) {
        systemContent += `\n\n${config.systemPromptDetailMode}`
      }
      if (webContext) systemContent += `\n\n## Web search results\n${webContext}`
      systemContent += `\n\n## Portfolio context\n${context}`

      const apiMessages = [{ role: 'system', content: systemContent }, ...messages]

      const maxTokens = wantsDetail ? config.MAX_COMPLETION_TOKENS_DETAIL : config.MAX_COMPLETION_TOKENS

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

      if (shouldGenerateExampleBlocks(lastQuestion)) {
        const blocks = await generateBlocks({
          question: lastQuestion,
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
          detailMode: wantsDetail,
          maxTokens,
        }),
      )
    } catch (err) {
      console.error('Chat error:', requestId, err)
      if (!res.headersSent) {
        const status = err?.status || 500
        const message = status === 500 ? 'Failed to get response. Try again later.' : err?.message
        res.status(status).json({ error: message })
      } else {
        writeNdjson(res, { type: 'error', error: 'Stream error' })
        res.end()
      }
    }
  })

  return router
}

