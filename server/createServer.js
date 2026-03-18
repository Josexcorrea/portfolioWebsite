import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import OpenAI from 'openai'
import { existsSync } from 'fs'
import path from 'path'
import { createCachedFileVectorStore } from './lib/vectorStore.js'
import { createChatRouter } from './routes/chat.js'

function parseCorsAllowlist(raw) {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function createServer() {
  const app = express()
  const port = process.env.PORT || 3001
  const isProd = process.env.NODE_ENV === 'production'

  app.disable('x-powered-by')

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'none'"],
              objectSrc: ["'none'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              fontSrc: ["'self'", 'data:'],
              connectSrc: ["'self'", 'https:'],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  )

  app.use(
    helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin',
    }),
  )

  // Helmet does not ship a permissionsPolicy middleware; set the header directly.
  // This disables a few powerful features site-wide.
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
      ].join(', '),
    )
    next()
  })

  app.use(helmet.frameguard({ action: 'deny' }))

  if (isProd) {
    app.use(
      helmet.hsts({
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
        preload: true,
      }),
    )
  }

  // If deployed behind a proxy/CDN, make sure req.ip is real (needed for rate limiting).
  if (isProd) app.set('trust proxy', 1)

  // CORS: allow only your site in production (comma-separated allowlist).
  const corsAllowlist = parseCorsAllowlist(process.env.CORS_ORIGIN)
  if (isProd && corsAllowlist.length === 0) {
    throw new Error('CORS_ORIGIN is required in production (comma-separated list of allowed origins).')
  }

  app.use(
    cors({
      origin(origin, cb) {
        // Non-browser clients (no Origin header). Keep allowed so health checks / curl work.
        if (!origin) return cb(null, true)

        if (!isProd) return cb(null, true)
        return cb(null, corsAllowlist.includes(origin))
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      credentials: false,
      maxAge: 600,
    }),
  )

  // Body limit to prevent large payloads
  app.use(express.json({ limit: '100kb' }))

  // Rate limit: protect API key from abuse (e.g. 20 chat requests per minute per IP)
  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
    message: { error: 'Too many requests. Try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Allow the server to boot even without an OpenAI key (chat route will return an error).
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

  const config = {
    CHAT_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    RAG_TOP_K: 3,
    RAG_MIN_SCORE: parseFloat(process.env.RAG_MIN_SCORE || '0.78'),
    MAX_COMPLETION_TOKENS: 256,
    systemPromptBase: `You are a concise, friendly assistant for Jose Correa's portfolio website.

Style rules:
- Answer in 2–4 short sentences unless the user clearly asks for more detail.
- Do not repeat the user's question.
- Avoid filler like "great question", "as an AI", apologies, or long intros.
- Use simple, everyday language and get to the point quickly.

Knowledge rules:
- Use the portfolio context to answer questions about Jose's projects, experience, and background.
- When web search results are provided, you may answer general questions using them.
- If you still do not know the answer, say you don't know instead of making something up.`,
  }

  const store = createCachedFileVectorStore()

  app.use('/api', createChatRouter({ chatLimiter, openai, config, store }))

  // Production: serve the built SPA from the same origin.
  if (isProd) {
    const distDir = path.join(process.cwd(), 'dist')
    const indexHtml = path.join(distDir, 'index.html')
    if (existsSync(distDir) && existsSync(indexHtml)) {
      // Cache hashed assets aggressively, but never cache the HTML shell.
      app.use(
        express.static(distDir, {
          maxAge: '1y',
          immutable: true,
          setHeaders(res, filePath) {
            // Prevent broken deploys due to cached HTML pointing to old asset hashes.
            if (filePath.endsWith('.html')) {
              res.setHeader('Cache-Control', 'no-store')
              return
            }

            // Extra safety for browsers + CDN edge caches.
            res.setHeader('X-Content-Type-Options', 'nosniff')
          },
        }),
      )
      app.get('*', (req, res) => {
        // Only handle GET SPA navigations; API is on /api and already mounted above.
        if (req.method !== 'GET') return res.sendStatus(405)
        res.sendFile(indexHtml)
      })
    }
  }

  return { app, port }
}

