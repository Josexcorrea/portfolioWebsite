import { embedOne } from '../lib/embed.js'

export function buildRagContext(chunks) {
  if (!chunks || chunks.length === 0) return 'No relevant context found.'
  return chunks.map((c) => `[${c.documentTitle}]\n${c.chunkText}`).join('\n\n---\n\n')
}

export async function getRagContext({
  question,
  openai,
  store,
  topK,
  minScore,
}) {
  const queryEmbedding = await embedOne(question, openai)
  const chunks = await store.search(queryEmbedding, { topK, minScore })
  return { chunks, context: buildRagContext(chunks) }
}

