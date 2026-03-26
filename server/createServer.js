import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import OpenAI from 'openai'
import { existsSync, readFileSync } from 'fs'
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

function buildTechStackSummary() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const deps = pkg?.dependencies || {}
    const devDeps = pkg?.devDependencies || {}

    const has = (name) => Boolean(deps?.[name] || devDeps?.[name])
    const v = (name) => deps?.[name] || devDeps?.[name] || ''

    const lines = []
    if (has('react')) lines.push(`- Frontend: React ${v('react')}`.trim())
    if (has('vite')) lines.push(`- Build/dev: Vite ${v('vite')}`.trim())
    if (has('typescript')) lines.push(`- Language: TypeScript ${v('typescript')}`.trim())
    if (has('tailwindcss')) lines.push(`- Styling: Tailwind CSS ${v('tailwindcss')}`.trim())
    if (has('three') || has('@react-three/fiber') || has('@react-three/drei')) {
      lines.push(
        `- 3D: three.js ${v('three')}, @react-three/fiber ${v('@react-three/fiber')}, @react-three/drei ${v('@react-three/drei')}`.trim(),
      )
    }
    if (has('express')) lines.push(`- Backend: Node.js + Express ${v('express')}`.trim())
    if (has('openai')) lines.push(`- AI chat: OpenAI SDK ${v('openai')} (RAG + web search)`.trim())
    if (has('dotenv')) lines.push(`- Config: dotenv ${v('dotenv')}`.trim())
    if (has('helmet') || has('cors') || has('express-rate-limit')) {
      lines.push(
        `- Security: helmet ${v('helmet')}, cors ${v('cors')}, express-rate-limit ${v('express-rate-limit')}`.trim(),
      )
    }
    if (has('react-markdown') || has('remark-gfm') || has('rehype-sanitize')) {
      lines.push(
        `- Markdown: react-markdown ${v('react-markdown')}, remark-gfm ${v('remark-gfm')}, rehype-sanitize ${v('rehype-sanitize')}`.trim(),
      )
    }

    return lines.length ? lines.join('\n') : 'Tech stack: (unavailable).'
  } catch {
    return 'Tech stack: (unavailable).'
  }
}

function buildSiteImplementationNotes() {
  const lines = []

  // 3D model notes (keep factual; do not guess external sources).
  const computerModelPublicPath = '/computerModel.glb'
  const computerModelFsPath = path.join(process.cwd(), 'public', 'computerModel.glb')
  const computerModelPresent = existsSync(computerModelFsPath)
  lines.push(
    `- 3D hero model: ${computerModelPublicPath} (loaded in src/features/hero/ComputerModel.tsx via @react-three/drei useGLTF). File present in public/: ${
      computerModelPresent ? 'yes' : 'no'
    }.`,
  )
  lines.push(
    '- 3D model origin/attribution: generated/downloaded from Meshy AI (meshy.ai).',
  )

  // Chat notes
  lines.push('- Chat API endpoint: POST /api/chat (server/routes/chat.js).')
  lines.push('- RAG context: server/knowledge/* and vector store in server/lib/vectorStore.js.')
  lines.push('- Web search: Tavily (env: TAVILY_API_KEY) in server/services/webSearch.js.')
  lines.push(
    '- Chat length / retrieval (env): MAX_COMPLETION_TOKENS (default 256), MAX_COMPLETION_TOKENS_DETAIL (default 2048), RAG_TOP_K (default 3), RAG_TOP_K_DETAIL (default 12), RAG_MIN_SCORE_DETAIL (default 0.18, detail questions only). Detail mode triggers on phrases like "technical", "architecture", "in depth", "explain how".',
  )
  lines.push(
    '- GitHub for RAG: `npm run build-knowledge` — optional full tree (`GITHUB_FULL_TREE=true`, server/lib/githubFullTreeIndex.js) or partial paths (githubRepoFetch.js). `npm run verify-github` checks raw URLs. Env: GITHUB_TOKEN recommended, GITHUB_FETCH_REPO=false skips all GitHub fetches.',
  )

  return lines.join('\n')
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
  const techStackSummary = buildTechStackSummary()
  const implementationNotes = buildSiteImplementationNotes()

  const config = {
    CHAT_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    RAG_TOP_K: parseInt(process.env.RAG_TOP_K || '3', 10),
    /** Extra chunks when the user asks for technical depth (see chat.js). */
    RAG_TOP_K_DETAIL: parseInt(process.env.RAG_TOP_K_DETAIL || '12', 10),
    // Cosine similarity floor. Your current embeddings typically top out around ~0.4,
    // so a higher threshold can cause retrieval to return zero chunks.
    RAG_MIN_SCORE: parseFloat(process.env.RAG_MIN_SCORE || '0.25'),
    /** Relaxed floor only in detail/technical question mode (see chat.js). */
    RAG_MIN_SCORE_DETAIL: parseFloat(process.env.RAG_MIN_SCORE_DETAIL || '0.18'),
    MAX_COMPLETION_TOKENS: parseInt(process.env.MAX_COMPLETION_TOKENS || '256', 10),
    /** Longer answers when the user asks for depth / architecture / implementation. */
    MAX_COMPLETION_TOKENS_DETAIL: parseInt(process.env.MAX_COMPLETION_TOKENS_DETAIL || '2048', 10),
    systemPromptBase: `You are a concise, friendly assistant for Jose Correa's portfolio website.

Style rules:
- Answer in 2–4 short sentences unless the user clearly asks for more detail.
- If the user asks "who", include the requested names (when present in the provided context) and do not guess.
- Do not repeat the user's question.
- Avoid filler like "great question", "as an AI", apologies, or long intros.
- Use simple, everyday language and get to the point quickly.

Knowledge rules:
- Use the portfolio context to answer questions about Jose's projects, experience, and background. The context may include excerpts from public GitHub (README, configs, and—if enabled at build time—filtered source files from full-tree indexing), plus site copy and PDFs. Prefer technical details from those excerpts when answering in-depth questions.
- "Who did Jose work on?": interpret as "which projects/roles did Jose work on" and answer using the portfolio context (and any matching research PDF chunks in the retrieved context).
- "Who did Jose work with?"/"who did he work with on ...?": interpret as collaborators/teammates/other people named in the research PDF or other indexed passages.
  - For the Power Distribution Module / PDM: only list names that appear in the provided context; if you can't find collaborator names in the retrieved context, say you couldn't find them in the indexed sources and point to the Experience & Projects section (and the PDM research PDF in Projects). Do not infer names.
  - For other projects/roles: only list names that appear in the provided context. If the retrieved context does not include any collaborator names for that project, respond with: "I don't see any collaborator names for that project in the indexed sources, so I'm treating it as Jose working alone (based on what's available)." Do not infer additional names.
    - When applying this solo-work fallback, do not say "can't find names", do not say "check Experience & Projects", and do not suggest other sections.
- Use the tech stack section below to answer "what stack is this site built with?" and "how did you build X on the site?" questions.
- When asked how something works on the site, explain the approach at a high level and mention the relevant parts (frontend, backend API, RAG, web search) without claiming features that aren't in the context.
- For asset-origin questions (e.g. “where did the 3D model come from?”): only answer with what is known from the implementation notes (file path, where it is loaded, whether it exists in the repo). Do not guess a source like Sketchfab/CAD unless that source is explicitly provided in the context.
- When web search results are provided, you may answer general questions using them.
- If you still do not know the answer, say you don't know instead of making something up.
- Never tell the user that "no relevant context" was found; speak naturally and point to the site sections if knowledge is thin.

Detail / technical mode (the app may append extra instructions when the user asks for depth):
- When asked for technical depth, architecture, implementation, or a walkthrough, give a structured answer: short sections or bullet points are OK.
- Stay grounded in the portfolio context and implementation notes; do not invent file paths, APIs, or metrics that are not supported by the context.
- If the context names a public source code URL for a project, you may mention it; do not guess GitHub URLs.`,
  }

  /** Appended when the user’s message signals they want depth (see server/routes/chat.js). */
  config.systemPromptDetailMode = `
## Response mode: technical depth
The user asked for detailed / technical / architectural explanation.
- Use multiple short paragraphs and/or bullet lists so the answer is easy to scan.
- Prefer concrete terms from the portfolio context (stacks, subsystems, constraints, evaluation methods).
- If something is not in the context, say what is unknown rather than inventing internals.
- If a public repository URL appears in the portfolio context for the relevant project, you may include it once at the end under a line like "Source:".
`.trim()

  config.systemPromptBase += `\n\nMath / formulas:\n- For equations, use LaTeX: inline $...$ or display $$...$$. The chat UI renders math with KaTeX.\n- Prefer one clear statement per formula; avoid repeating the same equation in multiple forms.\n`

  config.systemPromptBase += `\n\n## Site tech stack (from package.json)\n${techStackSummary}\n`
  config.systemPromptBase += `\n## Site implementation notes (from repo)\n${implementationNotes}\n`

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

