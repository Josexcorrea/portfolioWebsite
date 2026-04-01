# Backend (`server/`)

## Purpose

This folder contains the Node.js chat API, the RAG (retrieval-augmented generation) pipeline, knowledge-ingestion scripts, and shared runtime code used by both **Express** (local or single-process hosting) and the **Vercel** serverless handler at [`../api/chat.js`](../api/chat.js).

## Runtime split

| Environment | How `POST /api/chat` runs |
|-------------|---------------------------|
| **Local / VPS** | [`index.js`](./index.js) loads env, ensures embeddings exist, then [`createServer.js`](./createServer.js) mounts routes under `/api`. |
| **Vercel** | [`api/chat.js`](../api/chat.js) parses the body, applies optional Upstash rate limiting, then calls the same route logic with [`buildChatRuntime()`](./lib/chatRuntime.js) from [`lib/chatRuntime.js`](./lib/chatRuntime.js). |

Both paths use **`executeChatPost`** from [`routes/chat.js`](./routes/chat.js) so streaming behavior and errors stay aligned.

## Entry points

- **[`index.js`](./index.js):** `dotenv`, [`ensureEmbeddings`](./scripts/ensure-embeddings.js), `createServer().listen`.
- **[`createServer.js`](./createServer.js):** Express app with security headers, CORS (production allowlist required), JSON body limit, chat rate limiter, `/api` router, optional static serving of `dist/` in production.
- **[`lib/chatRuntime.js`](./lib/chatRuntime.js):** Builds OpenAI client, system prompt (including tech stack and implementation notes from the repo), retrieval config, and file-backed vector store.

## `POST /api/chat` contract

- **Method:** `POST` only. Other methods return **405**.
- **Body:** JSON with a **`messages`** array (OpenAI-style roles). The handler uses the **last user** message as the question. Empty or missing messages → **400**. Missing **`OPENAI_API_KEY`** → **500** with a clear error.
- **Success:** **`Content-Type: application/x-ndjson`**. Each line is a JSON object. Common **`type`** values: **`delta`** (assistant text chunks), **`blocks`** (optional structured examples), **`done`** (stream finished), **`error`** (if the stream fails after headers were sent). The frontend consumes this as a newline-delimited stream.
- **Rate limit:** **429** with a JSON error when limits apply (Express per IP; Vercel when Upstash is configured—see below).

For request shaping and retrieval heuristics (detail mode, collaborator-related tuning), see [`routes/chat.js`](./routes/chat.js).

## RAG pipeline (summary)

1. **Query:** The last user string is embedded with OpenAI ([`lib/embed.js`](./lib/embed.js)).
2. **Search:** [`lib/vectorStore.js`](./lib/vectorStore.js) loads chunk metadata and embeddings from [`knowledge/embeddings.json`](./knowledge/embeddings.json) (built offline) and returns top chunks above a score threshold. Tunables include **`RAG_TOP_K`**, **`RAG_MIN_SCORE`**, and detail-mode overrides (see [`.env.example`](../.env.example) and `chatRuntime` defaults).
3. **Context:** [`services/rag.js`](./services/rag.js) formats chunks for the system prompt. Optional **Tavily** web search adds snippets when **`TAVILY_API_KEY`** is set ([`services/webSearch.js`](./services/webSearch.js)).
4. **Generation:** Streaming chat completion; math in the stream may pass through [`lib/streamMathFormatter.js`](./lib/streamMathFormatter.js). Optional example **`blocks`** are generated in [`services/blocks.js`](./services/blocks.js) when enabled.

The folder [`knowledge/sources/`](./knowledge/sources/) holds raw inputs for sync/build scripts; generated artifacts belong under `knowledge/` (including `embeddings.json`).

## npm scripts (repo root)

These commands run files under `server/scripts/`:

| Script | Script file | Role |
|--------|-------------|------|
| `npm run sync-knowledge` | [`scripts/sync-knowledge-from-source.js`](./scripts/sync-knowledge-from-source.js) | Refresh processed knowledge from sources (including optional GitHub). |
| `npm run build-knowledge` | [`scripts/build-knowledge.js`](./scripts/build-knowledge.js) | Build chunks and `embeddings.json` (requires `OPENAI_API_KEY`). |
| `npm run rebuild-knowledge` | (chained) | `sync-knowledge` then `build-knowledge`. |
| `npm run verify-github` | [`scripts/verify-github-repos.js`](./scripts/verify-github-repos.js) | Verify GitHub URLs referenced in content. |
| `npm run server` / `npm run start:server` | [`index.js`](./index.js) | Start the Express API. |

GitHub indexing and file filters are controlled by env vars listed in [`.env.example`](../.env.example) (`GITHUB_TOKEN`, `GITHUB_FULL_TREE`, limits, allow/deny lists).

## Security and operations

- **Helmet** sets CSP and related headers in production; **`trust proxy`** is enabled in production for correct client IPs behind a reverse proxy.
- **CORS:** In production, **`CORS_ORIGIN`** must be a comma-separated allowlist; if it is empty, `createServer` throws at startup (browser requests must send an allowed `Origin`).
- **Body size:** JSON payloads are capped (see `express.json` limit in `createServer.js`).
- **Rate limiting:** Express uses **`express-rate-limit`** with **`RATE_LIMIT_MAX`** (per minute per IP). On Vercel, [`lib/vercelRateLimit.js`](./lib/vercelRateLimit.js) uses Upstash when **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`** are set; otherwise requests are not throttled on the function.
- **Static assets in production:** When `dist/` exists, hashed assets are cached; `index.html` is not cached (see `createServer.js`).

## Parent documentation

[Repository root README](../README.md) · [Frontend README](../src/README.md)
