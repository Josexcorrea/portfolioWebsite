# Frontend (`src/`)

## Purpose

The frontend is a React single-page application with full-viewport scroll sections, a fixed navigation rail, and a floating portfolio chat widget. Section order, labels, and wiring are driven from one configuration list so navigation and content stay aligned.

## Stack

- **React** and **TypeScript** with **Vite** as the dev server and bundler.
- **Tailwind CSS** for layout and typography ([`vite.config.ts`](../vite.config.ts) uses `@tailwindcss/vite`).
- **three.js** with **@react-three/fiber** and **@react-three/drei** for the hero computer model and the skills area (dome, meteors, mini-game).
- **react-markdown** with **remark-gfm**, **remark-math**, **rehype-katex**, and **rehype-sanitize** for assistant messages in the chat UI.

The path alias **`@/`** resolves to this directory (`src/`).

## Directory layout

```
src/
├── app/                 # Shell: scroll sections, nav, background, section renderer
│   ├── App.tsx
│   ├── sections.ts      # SCROLL_SECTIONS, SectionId, getSectionLabel
│   ├── components/
│   └── hooks/
├── components/
│   ├── ui/              # Reusable primitives (badges, glare, sparks)
│   ├── layout/          # SectionBlock, ScrollNav, list/detail layouts
│   └── views/           # One main view per section (Home, Skills, Work, Contact)
├── contexts/            # e.g. ChatGlobeProvider for chat + 3D coordination
├── features/
│   ├── chat/            # Widget, panel, streaming client, message UI
│   ├── hero/            # 3D computer scene
│   └── skills/          # 3D skills dome and related
├── data/
│   ├── content/         # experiences, projects, skills, contact copy
│   └── site.ts          # Site-wide constants (e.g. avatar path)
├── types/
└── styles/
    └── global.css
```

## Sections and navigation

[`app/sections.ts`](./app/sections.ts) exports **`SCROLL_SECTIONS`**: the canonical list of section ids and labels. [`App.tsx`](./app/App.tsx) composes [`SectionRenderer`](./app/components/SectionRenderer.tsx) and [`ScrollNav`](./components/layout/ScrollNav.tsx); add or reorder sections only in `sections.ts` so refs, labels, and nav stay consistent.

## Chat client

The widget posts to **`POST /api/chat`** with a same-origin **`fetch`** (no `VITE_*` base URL). The stream is **NDJSON** (`application/x-ndjson`): lines are JSON objects with types such as `delta`, `blocks`, `done`, and `error`. Client logic lives under [`features/chat/`](./features/chat/), including [`api.ts`](./features/chat/api.ts) for the HTTP layer and [`state/useChatController.ts`](./features/chat/state/useChatController.ts) for session state and streaming handling. Server behavior and env vars are described in [the backend README](../server/README.md).

## Content and assets

- **Editable copy and structured data** live in [`data/content/`](./data/content/) (experiences, projects, skills, contact) and [`data/site.ts`](./data/site.ts).
- **Binary and static files** (favicon, photos, GLB model, case-study media) live in [`public/`](../public/) at the repo root; URLs are typically rooted at `/` (for example `/computerModel.glb`). Project and experience entries reference paths that must match files under `public/` or remote URLs as you define them in the content modules.

## Parent documentation

[Repository root README](../README.md)
