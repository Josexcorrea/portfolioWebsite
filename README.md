# Portfolio Website

Personal portfolio with RAG-powered chat. Built with React, Vite, TypeScript, and a small Node/Express API for chat and knowledge.

## Quick start

```bash
npm install
npm run dev          # Frontend only (Vite)
npm run server       # API only (Express on :3001)
npm run dev:full     # Both (concurrently, for local dev)
```

- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Lint / typecheck:** `npm run check` (runs `typecheck` then `lint`)

## Environment

Copy `.env.example` to `.env` and set:

- `OPENAI_API_KEY` – required for chat
- `PORT` – server port (default 3001)
- `CORS_ORIGIN` – comma-separated allowed origins (required in production), e.g. `https://yourdomain.com,https://www.yourdomain.com`

Optional: run `npm run sync-knowledge` then `npm run build-knowledge` to refresh RAG documents/embeddings.

## Deployment (single Node service)

This repo supports serving the built frontend from the Express server in production.

```bash
npm run build
NODE_ENV=production npm run start
```

Set these environment variables on your host:
- `OPENAI_API_KEY`
- `CORS_ORIGIN` (your site domain allowlist)
- `PORT` (if your host requires it)

## Architecture

Layout follows a clear separation of app shell, shared components, feature modules, and data.

```
src/
├── app/                 # Shell & section config (single source of truth)
│   ├── App.tsx          # Scroll sections, nav, chat widget
│   └── sections.ts      # SCROLL_SECTIONS, getSectionLabel, SectionId
├── components/
│   ├── ui/              # Primitives (ClickSpark, GlareHover, SkillBadges)
│   ├── layout/          # SectionBlock, ScrollNav, list-detail layouts
│   └── views/           # Section content (Home, Skills, Experience, Contact)
├── features/            # Feature modules
│   ├── chat/            # RAG chat widget + API client
│   ├── hero/            # 3D computer (home)
│   └── skills/          # 3D dome, meteor field, mini-game
├── data/                # Static content & site config
│   ├── content/         # contact, experiences, projects, skills
│   └── site.ts          # e.g. avatar URL
├── types/               # Shared TS types (View = SectionId)
└── styles/
    └── global.css
```

- **Sections:** Add or reorder sections only in `src/app/sections.ts`. App and ScrollNav use it for refs, labels, and nav.
- **Views:** One component per scroll section; composed in `App.tsx`.
- **Features:** Self-contained (chat, 3D skills). Views may import from `@/features/...`.

## Public assets

Place static assets in `public/`. The app references at least: `favicon.svg`, `pfp.jpeg` (see `src/data/site.ts`), `playerCard.png`, `computerModel.glb` (3D hero), plus project preview images/videos and PDFs listed in `src/data/content/projects.ts`. Add or adjust paths there if files differ.

## Server

`server/` is plain Node/Express (no TypeScript). Endpoints:

- `POST /api/chat` – streaming RAG chat (OpenAI + vector store).

Knowledge build scripts live in `server/scripts/`; embeddings and documents in `server/knowledge/`.
