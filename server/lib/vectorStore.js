import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Cosine similarity between two vectors. */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

/**
 * File-based vector store for dev. Records: { id, chunkText, documentTitle, embedding }.
 * @param {string} [filePath] - Path to JSON file (default: server/knowledge/embeddings.json)
 */
export function createFileVectorStore(filePath = null) {
  const fp = filePath || path.join(__dirname, '..', 'knowledge', 'embeddings.json')

  function load() {
    if (!existsSync(fp)) return []
    const raw = readFileSync(fp, 'utf8')
    return JSON.parse(raw)
  }

  return {
    /**
     * Search by embedding, return top k records (by cosine similarity).
     * @param {number[]} queryEmbedding
     * @param {{ topK?: number }} [opts]
     * @returns {Promise<Array<{ chunkText: string, documentTitle: string }>>}
     */
    async search(queryEmbedding, opts = {}) {
      const topK = opts.topK ?? 3
      const minScore = opts.minScore ?? 0
      const records = load()
      if (records.length === 0) return []
      const withScore = records.map((r) => ({
        ...r,
        score: cosineSimilarity(queryEmbedding, r.embedding),
      }))
      withScore.sort((a, b) => b.score - a.score)
      return withScore
        .filter((r) => r.score >= minScore)
        .slice(0, topK)
        .map(({ chunkText, documentTitle }) => ({ chunkText, documentTitle }))
    },

    /**
     * Save records (full replace). Each item: { id, chunkText, documentTitle, embedding }.
     * @param {Array<{ id: string, chunkText: string, documentTitle: string, embedding: number[] }>} records
     */
    async save(records) {
      writeFileSync(fp, JSON.stringify(records, null, 0), 'utf8')
    },
  }
}

/**
 * Cached file-based vector store. Keeps embeddings in memory and reloads when file changes.
 * Intended for the chat API runtime (avoids JSON parse on every request).
 */
export function createCachedFileVectorStore(filePath = null) {
  const fp = filePath || path.join(__dirname, '..', 'knowledge', 'embeddings.json')

  let cache = null
  let cachedMtimeMs = 0

  function loadCached() {
    if (!existsSync(fp)) {
      cache = []
      cachedMtimeMs = 0
      return cache
    }

    const mtimeMs = statSync(fp).mtimeMs
    if (cache && mtimeMs === cachedMtimeMs) return cache

    const raw = readFileSync(fp, 'utf8')
    cache = JSON.parse(raw)
    cachedMtimeMs = mtimeMs
    return cache
  }

  return {
    async search(queryEmbedding, opts = {}) {
      const topK = opts.topK ?? 3
      const minScore = opts.minScore ?? 0
      const records = loadCached()
      if (records.length === 0) return []

      const withScore = records.map((r) => ({
        ...r,
        score: cosineSimilarity(queryEmbedding, r.embedding),
      }))
      withScore.sort((a, b) => b.score - a.score)
      return withScore
        .filter((r) => r.score >= minScore)
        .slice(0, topK)
        .map(({ chunkText, documentTitle }) => ({ chunkText, documentTitle }))
    },

    async save(records) {
      writeFileSync(fp, JSON.stringify(records, null, 0), 'utf8')
      cache = records
      try {
        cachedMtimeMs = existsSync(fp) ? statSync(fp).mtimeMs : cachedMtimeMs
      } catch {
        // ignore
      }
    },
  }
}

export { cosineSimilarity }
