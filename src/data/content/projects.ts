/**
 * Optional `code`: public GitHub repo URL — “View Code” + indexed for chat (see `npm run build-knowledge`, README fetch).
 * Username matches contact (`josexcorrea`); change repo slugs if your GitHub names differ. Remove `code` if private.
 * Optional `link`: any public URL for “View Live” (not required for the site).
 */
import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'sports-betting',
    name: 'Sports Card',
    tagline: 'Personal Project',
    dateMade: '2024 – Present',
    mission:
      'Turn sportsbook prices into repeatable decisions by learning a fair “no‑vig” price from historical line movement. The engine flags mispricings, sizes risk, and measures edge using closing-line performance rather than short-term win rate.',
    system:
      'A Python machine-learning pipeline that ingests historical odds/line snapshots across books, normalizes markets, strips vig to estimate no‑vig implied probabilities, and learns fair prices from line dynamics using strict “as-of” timestamps and time-series walk-forward validation to avoid leakage. A live scanner compares current prices to the model’s fair price to surface +EV opportunities, applies stake sizing, and tracks results with CLV/beat-the-close monitoring to validate whether the model is truly capturing edge.',
    description:
      'Built an end-to-end pricing and screening system that treats sportsbook odds as a market to model—rather than relying on league box-score stats. The pipeline ingests historical odds/line snapshots, cleans and normalizes markets across books, removes vig to estimate no‑vig probabilities, and trains time-aware ML models on line movement signals using walk-forward validation. For each market, the engine estimates a fair price, compares it to live sportsbook pricing, and surfaces opportunities where the market appears mispriced. To keep evaluation honest, performance is monitored via closing-line value (CLV) / beat-the-close tracking, with stake sizing and bet/result logging to support ongoing calibration.',
    impact: [
      'Treats odds as a market signal: historical line snapshots, book-normalized markets, and no‑vig implied probabilities feed time-aware models with strict “as-of” ordering.',
      'Walk-forward validation and leakage-aware splits so reported edge isn’t inflated by peeking into the future.',
      'Live scanner compares current prices to learned fair prices, applies stake sizing, and logs bets/results for calibration.',
      'Measures quality with CLV and beat-the-close—not vanity win rate—so the system chases durable edge.',
      'End-to-end path from ingestion to screening, sized for iterative experimentation on new markets and features.',
    ],
    keyLearnings: [
      'Line movement and cross-book disagreement often carry more usable signal than treating each price as a static snapshot.',
      'Honest sports modeling is mostly about time discipline: timestamps, splits, and never letting future information leak backward.',
      'Production screening needs the same rigor as research—logging, monitoring, and a clear definition of “edge” you can audit.',
    ],
    badges: ['react', 'typescript', 'tailwindcss', 'python', 'pytorch', 'numpy', 'scikitlearn'],
    code: 'https://github.com/josexcorrea/sports-card',
    previewType: 'video',
    previewUrl: '/sportsCardDemo.mp4',
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    tagline: 'Personal Product',
    dateMade: '2026',
    mission:
      'Ship a portfolio that proves product engineering: fast UI, production-grade backend, and an AI assistant that explains my work with grounded, source-backed answers.',
    system:
      'A React + TypeScript + Tailwind SPA (Vite) paired with a Node/Express chat API that streams responses and uses retrieval-augmented generation (RAG) over curated portfolio documents plus indexed PDFs. The knowledge pipeline chunks sources, generates embeddings, and serves top matches from a cached file-based vector store that hot-reloads when embeddings change, with optional web search augmentation for general queries. The API is production-hardened with Helmet security headers, request size limits, rate limiting, and CORS allowlisting.',
    description:
      'Built my portfolio as a product, not a brochure: a performance-focused UI with clear information hierarchy, interactive previews, and an AI chat assistant that can answer “how does this work?” questions without hallucinating. The assistant is grounded with RAG over curated knowledge files and PDFs, and it stays current via an explicit embedding rebuild workflow plus a cached vector store that reloads automatically when the knowledge index changes. On the backend, I implemented a streaming chat endpoint with guardrails and security hardening so the feature can ship safely (rate limiting, CORS allowlisting, and strict headers). The result is a single cohesive build that demonstrates front-end craft, backend reliability, and practical AI system design end-to-end.',
    impact: [
      'Grounded chat: RAG over curated text and PDFs so answers tie back to real sources instead of invented detail.',
      'Streaming API with sensible limits—Helmet, body size caps, rate limiting, and CORS allowlisting for safer public deployment.',
      'Embeddings pipeline and cached vector index with a rebuild path when knowledge changes.',
      'One cohesive product story: UI, previews, backend, and AI behavior designed together—not bolted on.',
    ],
    keyLearnings: [
      'RAG quality is chunking, retrieval, and freshness; the model is only as trustworthy as the index you feed it.',
      'For a personal site, a file-backed store and explicit embed jobs can be enough—complex infra isn’t always the win.',
      'Shipping “AI” means ops: guardrails, observability, and a contract for what the assistant is allowed to claim.',
    ],
    badges: [
      'react',
      'typescript',
      'tailwindcss',
      'vite',
      'nodejs',
      'express',
      'openai',
    ],
    code: 'https://github.com/josexcorrea/portfolio-website',
    previewType: 'site',
    // No previewUrl on purpose: the user is already on the site.
  },
  {
    id: 'pdm',
    name: 'Power Distribution Module',
    tagline: 'FIU Formula SAE',
    dateMade: '2025',
    mission:
      'Make electrical failures diagnosable in minutes, not hours, by turning noisy serial telemetry into clear, real-time channel health and repeatable test workflows. The goal is safer validation and faster iteration under race-week constraints.',
    system:
      'A real-time monitoring and control stack with a Python (Flask) backend and an Electron desktop application (React + TypeScript). The system ingests a 58-byte serial telemetry stream (~10 Hz), validates frames (checksum + defensive parsing), decodes voltage/current/temperature per channel, and exposes channel control + test-mode workflows for repeatable failure-mode investigation.',
    description:
      'Led software development for an 8-channel PDM monitoring and control tool for an FIU Formula SAE race car, where fast feedback and reliability are non-negotiable. Built a Python (Flask) backend and Electron desktop app (React + TypeScript) that ingests a 58-byte serial stream (~10 Hz), validates frames, and decodes channel voltage/current/temperature into operator-friendly diagnostics. The UI highlights abnormal conditions, supports channel-level control, and provides repeatable test modes so the team can reproduce faults and verify fixes quickly. Implemented defensive parsing so corrupt/partial frames don’t crash the app, bridging raw electrical data into safe, actionable decisions.',
    impact: [
      'Continuous ~10 Hz telemetry with checksum validation and defensive parsing so corrupt frames don’t take down the session.',
      'Per-channel voltage, current, and temperature surfaced for fast triage during bring-up and race-week debugging.',
      'Channel control and repeatable test modes to reproduce faults and confirm fixes without guesswork.',
      'Desktop UI suitable for garage and trackside use—readable state, not just a raw serial log.',
      'Research write-up (PDF) documents methodology and results for handoff to future team members.',
    ],
    keyLearnings: [
      'Embedded UIs are trust UIs: operators need clear limits, units, and “what failed” without reading hex.',
      'Serial protocols reward paranoia—assume noise, partial reads, and out-of-order bytes.',
      'Telemetry software is part of the safety story: if the display lies or crashes, validation stops.',
    ],
    badges: ['python', 'flask', 'react', 'typescript', 'tailwindcss', 'electron'],
    code: 'https://github.com/josexcorrea/fiu-pdm',
    previewType: 'video',
    previewUrl: '/pdmDemo.mp4',
    researchPdfUrl: '/Pdm-report.pdf',
  },
  {
    id: 'netflix-clone',
    name: 'Netflix Clone Application',
    tagline: 'Personal Project',
    dateMade: '2024',
    mission:
      'Build a Netflix-style browsing experience with production-grade UI polish and a scalable component/state architecture. The focus is on responsiveness, perceived performance, and interaction details that feel like a real product—not a tutorial.',
    system:
      'A React + TypeScript frontend that renders catalog data from an external API with a component structure and state flow designed to scale. Emphasizes loading states, smooth section transitions, and UI performance patterns that keep browsing fast and responsive.',
    description:
      'Built a Netflix-style web app to practice production-quality front-end engineering in React + TypeScript. The UI is fully responsive and fetches movie/show catalogs from an API (not hard-coded lists), so it behaves like a real data-driven product. I focused on perceived performance—loading states, hover/interaction details, and smooth transitions—so browsing feels fast and polished. Under the hood, the component structure and state flow are designed to extend cleanly into features like search, profiles, and watchlists.',
    impact: [
      'API-backed catalog so rows and detail views behave like a real product, not mocked JSON.',
      'Responsive layout and interaction polish—hover, focus, and motion tuned for perceived speed.',
      'Explicit loading and empty states so the UI never feels “stuck” while data is in flight.',
      'Architecture leaves room to grow: search, profiles, and watchlists without rewriting the tree.',
    ],
    keyLearnings: [
      'Most “Netflix feel” is UX discipline: skeletons, prefetch hints, and layout stability beat raw FPS.',
      'Component boundaries should follow data boundaries—fetching, caching, and presentation separate cleanly.',
      'Front-end scale is mostly state flow: who owns data, when it refetches, and how errors surface.',
    ],
    badges: ['react', 'typescript', 'tailwindcss', 'html5', 'css3'],
    code: 'https://github.com/josexcorrea/netflix-clone',
    previewType: 'video',
    previewUrl: '/netflix-clone-demo.mp4',
  },
  {
    id: 'shelfos',
    name: 'ShelfOS',
    tagline: 'Inventory Management System',
    dateMade: '2026 – Present',
    mission:
      'Reduce reconciliation errors by unifying treatments, inventory consumption, and accounting into a single transactional system-of-record. ShelfOS produces audit-ready revenue/COGS while keeping inventory states correct under real-world voids, edits, and concurrency.',
    description:
      'Built ShelfOS as a desktop-first system with an Electron (React + TypeScript) UI and a Flask + SQLAlchemy backend over SQLite. ShelfOS couples operational inventory with accounting-grade reporting by enforcing a transactional source-of-truth: revenue and COGS are derived from persisted treatment/retail line items, while inventory is updated via typed, auditable inventory events. Correctness is the core feature—idempotent transaction processing, strict mutation guardrails, and precise void/refund semantics using write-time usage snapshots so reversals restore state exactly even if mappings change later. For decision support and month-end close, ShelfOS provides low-stock alerts, usage anomaly detection, reorder forecasting, cost creep detection, and accountant-friendly exports (ledger/CSV), plus monthly PDFs, receipts, and audit logs for traceability.',
    system:
      'ShelfOS comprises a desktop frontend (Electron + React/TypeScript) and a Flask + SQLAlchemy backend over SQLite. It maintains two coupled ledgers with a single accounting source of truth: revenue/COGS computed from immutable transaction line items, and inventory quantities updated through typed, auditable inventory events. The system enforces correctness via write-time cost/usage snapshotting, idempotent request handling, strict inventory guardrails, and precise void/reversal semantics. On top of the core ledger, it provides operational analytics (alerts, anomaly detection, forecasting) and accounting exports (ledger/CSV, PDFs, receipts) backed by audit logging.',
    impact: [
      'Single transactional ledger: line items drive revenue/COGS; inventory moves through typed, auditable events.',
      'Write-time snapshots so voids and refunds restore exact historical state even when costs or mappings change later.',
      'Idempotent processing and guardrails against double-applies and impossible inventory mutations.',
      'Operational analytics—low stock, anomalies, forecasting—and accountant-friendly CSV/ledger exports.',
      'Receipts, monthly PDFs, and audit logs aimed at traceable month-end close, not just on-screen totals.',
    ],
    keyLearnings: [
      'Inventory + money is a correctness problem first: every mutation needs a story and a reversal story.',
      'Snapshots beat “recompute from today” when history must survive business rule changes.',
      'Desktop + local SQLite can still behave like enterprise software if the data model is disciplined.',
    ],
    badges: ['electron', 'react', 'typescript', 'flask', 'python'],
    code: 'https://github.com/josexcorrea/shelfos',
    previewType: 'site',
  },
]
