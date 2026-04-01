/**
 * Vercel serverless entry for POST /api/chat (streaming NDJSON).
 *
 * Deployment:
 * - Vercel runs `npm run build` (Vite → dist) and deploys static assets + this function.
 * - Set secrets in Vercel → Project → Settings → Environment Variables (see .env.example):
 *   OPENAI_API_KEY (required), optional TAVILY_API_KEY, OPENAI_MODEL, RAG_* tuning, etc.
 * - RAG needs server/knowledge/embeddings.json bundled: vercel.json `includeFiles` for server/knowledge/**.
 *   Commit embeddings.json or generate it in CI before deploy (`npm run rebuild-knowledge`).
 * - Optional: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for per-IP rate limiting (parity with Express).
 *
 * Local dev: use `npm run dev:full` (Vite + Express :3001) or `npm run dev` with API proxied only if server runs.
 * Same-origin fetch('/api/chat') — no VITE_* API URL needed.
 */

import { buildChatRuntime } from '../server/lib/chatRuntime.js'
import { executeChatPost } from '../server/routes/chat.js'
import { limitChatRequestOrPass } from '../server/lib/vercelRateLimit.js'

let runtime
function getRuntime() {
  if (!runtime) runtime = buildChatRuntime()
  return runtime
}

/** @type {{ maxDuration?: number }} */
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed' })
    return
  }

  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body || '{}')
    } catch {
      req.body = {}
    }
  } else if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8') || '{}')
    } catch {
      req.body = {}
    }
  }

  const limited = await limitChatRequestOrPass(req)
  if (!limited.allowed) {
    res.status(429).json({ error: 'Too many requests. Try again in a minute.' })
    return
  }

  await executeChatPost(req, res, getRuntime())
}
