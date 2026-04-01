# Portfolio architecture and chat (indexed for RAG)

This file is embedded into `server/knowledge/embeddings.json` at build time (`npm run rebuild-knowledge`). It exists so the assistant can retrieve and **quote** deployment and system design details as **[S*]** sources—not only from inline implementation notes.

## Production deployment

- **Vercel:** The Vite SPA is served from `dist/`. The chat API is a serverless function at `api/chat.js` that calls the same `executeChatPost` logic as Express (`server/routes/chat.js`).
- **Build:** `vercel.json` uses `npm run rebuild-knowledge && npm run build` so the knowledge index and embeddings are refreshed before the static build.
- **Single Node alternative:** Run `server/index.js` with `NODE_ENV=production` to serve `dist/` and mount `/api` on one origin (see repository `README.md`).

## Chat request flow

1. The last user message is embedded after optional **retrieval query expansion** (e.g. FSAE, PDM, RAG acronyms) to improve cosine match against chunks.
2. **RAG:** `server/lib/vectorStore.js` searches `server/knowledge/embeddings.json` with tunable `RAG_TOP_K` and score floors; detail-style questions request more chunks and lower minimum scores.
3. Chunks are formatted with stable tags **[S1], [S2], …** and verbatim passage text for citation.
4. **Tavily** (`server/services/webSearch.js`) runs when appropriate: e.g. freshness queries, weak retrieval—not for every request, and typically skipped when the question is purely about this site’s hosting/RAG wiring and retrieval is strong.
5. The model receives **Site tech stack** (from `package.json`), **Site implementation notes** (paths, env-driven behavior), then **Portfolio context** (indexed passages), then optional **Web search results**.

## Knowledge index contents

- **Sync:** `npm run sync-knowledge` fills `documents.json` from `src/data/content` (projects and experiences).
- **Build:** `npm run build-knowledge` chunks documents, ingests `server/knowledge/sources/*` (except a skipped `readme.md` filename), public PDFs under `public/`, and optionally GitHub trees/READMEs when `GITHUB_TOKEN` and fetch flags allow.

For file layout and security (CORS, rate limits, Helmet), see `server/README.md` and `server/createServer.js`.
