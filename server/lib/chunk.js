/**
 * Chunk documents for RAG. Target ~500-800 tokens per chunk, ~100 token overlap.
 * Uses word-based heuristic: ~1.3 words per token → ~600 words/chunk, ~100 words overlap.
 */
const TARGET_CHUNK_WORDS = 600
const OVERLAP_WORDS = 100

function extractChunks(text, targetWords = TARGET_CHUNK_WORDS, overlapWords = OVERLAP_WORDS) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks = []
  let start = 0
  while (start < words.length) {
    const end = Math.min(start + targetWords, words.length)
    const slice = words.slice(start, end)
    chunks.push(slice.join(' '))
    if (end >= words.length) break
    start = end - overlapWords
  }
  return chunks
}

/**
 * @param {Array<{ title: string, content: string }>} documents
 * @returns {Array<{ chunkText: string, documentTitle: string }>}
 */
function chunkDocuments(documents) {
  const result = []
  for (const doc of documents) {
    const chunks = extractChunks(doc.content)
    for (const chunkText of chunks) {
      result.push({
        chunkText,
        documentTitle: doc.title,
      })
    }
  }
  return result
}

export { chunkDocuments, extractChunks, TARGET_CHUNK_WORDS, OVERLAP_WORDS }
