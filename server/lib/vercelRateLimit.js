import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/** @type {Ratelimit | null | undefined} undefined = not yet resolved */
let ratelimit = undefined
const inMemoryHits = new Map()
const WINDOW_MS = 60_000

/**
 * Per-IP sliding window for Vercel serverless (matches Express RATE_LIMIT_MAX / minute intent).
 * Uses Upstash when configured; falls back to in-memory best-effort limiting.
 */
function getRatelimit() {
  if (ratelimit !== undefined) return ratelimit
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    ratelimit = null
    return null
  }
  const redis = new Redis({ url, token })
  const max = parseInt(process.env.RATE_LIMIT_MAX || '20', 10)
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, '60 s'),
    prefix: 'portfolio-chat',
  })
  return ratelimit
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.length > 0) {
    return xf.split(',')[0].trim()
  }
  if (Array.isArray(xf) && xf[0]) {
    return xf[0].split(',')[0].trim()
  }
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && real.length > 0) return real
  return '127.0.0.1'
}

function inMemoryLimit(identifier) {
  const max = parseInt(process.env.RATE_LIMIT_MAX || '20', 10)
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const current = inMemoryHits.get(identifier) || []
  const next = current.filter((t) => t >= windowStart)
  if (next.length >= max) {
    inMemoryHits.set(identifier, next)
    return false
  }
  next.push(now)
  inMemoryHits.set(identifier, next)
  return true
}

/**
 * @returns {Promise<{ allowed: boolean }>}
 */
export async function limitChatRequestOrPass(req) {
  const identifier = clientIp(req)
  const rl = getRatelimit()
  if (!rl) return { allowed: inMemoryLimit(identifier) }
  const { success } = await rl.limit(identifier)
  return { allowed: success }
}
