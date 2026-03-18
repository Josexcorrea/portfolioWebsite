import express from 'express'
import { writeNdjson } from '../lib/ndjson.js'
import { getRagContext } from '../services/rag.js'
import { searchWeb } from '../services/webSearch.js'
import { generateBlocks, shouldGenerateExampleBlocks } from '../services/blocks.js'
import { sanitizeMessages } from '../services/sanitizeMessages.js'

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
      const { chunks, context } = await getRagContext({
        question: lastQuestion,
        openai,
        store,
        topK: config.RAG_TOP_K,
        minScore: config.RAG_MIN_SCORE,
      })

      const webResults = await searchWeb(lastQuestion)
      let webContext = ''
      if (webResults && webResults.length > 0) {
        webContext = webResults
          .map((r) => `Title: ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
          .join('\n\n---\n\n')
      }

      let systemContent = config.systemPromptBase
      if (webContext) systemContent += `\n\n## Web search results\n${webContext}`
      systemContent += `\n\n## Portfolio context\n${context}`

      const apiMessages = [{ role: 'system', content: systemContent }, ...messages]

      res.setHeader('Content-Type', 'application/x-ndjson')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()

      let fullAnswer = ''
      const stream = await openai.chat.completions.create({
        model: config.CHAT_MODEL,
        messages: apiMessages,
        max_tokens: config.MAX_COMPLETION_TOKENS,
        stream: true,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullAnswer += delta
          writeNdjson(res, { type: 'delta', content: delta })
        }
      }

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

      console.log(JSON.stringify({ requestId, route: '/api/chat', ok: true, ragChunks: chunks.length }))
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

