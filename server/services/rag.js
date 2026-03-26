import { embedOne } from '../lib/embed.js'

export function buildRagContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return (
      '(Portfolio RAG did not retrieve a matching passage for this query—often rephrase or run `npm run build-knowledge` after updating knowledge. ' +
      'For questions about Jose’s work, answer from web search if provided; otherwise say you don’t have that detail in the indexed knowledge and suggest the Experience & Projects section on the site (and the Power Distribution Module research PDF in Projects).)'
    )
  }
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

