# Frontend (`src/`)

## Purpose

The frontend is a React single-page application built around a **macOS-style desktop shell**: wallpaper, menu bar, dock, and draggable windows. Portfolio AI chat lives in its own window and shares state via `ChatGlobeProvider`.

## Stack

- **React** and **TypeScript** with **Vite** as the dev server and bundler.
- **Tailwind CSS** for layout and typography ([`vite.config.ts`](../vite.config.ts) uses `@tailwindcss/vite`).
- **three.js** with **@react-three/fiber** and **@react-three/drei** for the wallpaper computer model and the skills globe (dome, meteors, mini-game).
- **react-markdown** with **remark-gfm**, **remark-math**, **rehype-katex**, and **rehype-sanitize** for assistant messages in the chat UI.

The path alias **`@/`** resolves to this directory (`src/`).

## Directory layout

```
src/
├── app/                 # Entry: App.tsx mounts DesktopShell
├── desktop/             # Shell: context, windows, dock, menu bar, wallpaper
│   └── windows/         # One component per app (About, Projects, Chat, …)
├── components/
│   ├── ui/              # Reusable primitives (badges, glare, sparks, liquid glass)
│   └── views/           # Experience and Projects list/detail UIs (used by windows)
├── contexts/            # e.g. ChatGlobeProvider
├── features/
│   ├── chat/            # Streaming client, controller, message bubbles (ChatWindow)
│   ├── hero/            # 3D computer scene (wallpaper)
│   └── skills/          # 3D skills dome and related
├── data/
│   ├── content/         # experiences, projects, skills
│   └── site.ts          # Site-wide constants (e.g. avatar path)
├── lib/                 # Small utilities (e.g. cn)
├── types/
└── styles/
    └── global.css
```

## Desktop shell

[`app/App.tsx`](./app/App.tsx) renders [`desktop/DesktopShell.tsx`](./desktop/DesktopShell.tsx), which registers window content in one list and wraps the tree with `DesktopProvider` plus `ChatGlobeProvider`. To add or rename an “app”, update the registry in `DesktopShell` and matching types in `desktop/types.ts` / dock config as needed.

## Chat client

The chat window posts to **`POST /api/chat`** with a same-origin **`fetch`** (no `VITE_*` base URL). The stream is **NDJSON** (`application/x-ndjson`): lines are JSON objects with types such as `delta`, `blocks`, `done`, and `error`. Client logic lives under [`features/chat/`](./features/chat/), including [`api.ts`](./features/chat/api.ts) for the HTTP layer and [`state/useChatController.ts`](./features/chat/state/useChatController.ts) for session state and streaming handling. Server behavior and env vars are described in [the backend README](../server/README.md).

## Content and assets

- **Editable copy and structured data** live in [`data/content/`](./data/content/) (experiences, projects, skills) and [`data/site.ts`](./data/site.ts).
- **Binary and static files** (favicon, photos, GLB model, case-study media) live in [`public/`](../public/) at the repo root; URLs are typically rooted at `/` (for example `/computerModel.glb`). Project and experience entries reference paths that must match files under `public/` or remote URLs as you define them in the content modules.

## Parent documentation

[Repository root README](../README.md)
