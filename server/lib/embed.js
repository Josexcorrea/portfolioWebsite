import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'

/**
 * Get OpenAI client (requires OPENAI_API_KEY in env).
 */
export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required')
  return new OpenAI({ apiKey })
}

/**
 * Generate embedding for a single text.
 * @param {string} text
 * @param {OpenAI} [openai]
 * @returns {Promise<number[]>}
 */
async function embedOne(text, openai = null) {
  const client = openai || getOpenAI()
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8191),
  })
  return res.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in one batch (OpenAI allows up to 2048 inputs per request;
 * we batch in smaller sizes to stay safe).
 * @param {string[]} texts
 * @param {OpenAI} [openai]
 * @returns {Promise<number[][]>}
 */
async function embedMany(texts, openai = null) {
  const client = openai || getOpenAI()
  const batchSize = 100
  const out = []
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.slice(0, 8191))
    const res = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })
    const sorted = res.data.sort((a, b) => a.index - b.index)
    for (const d of sorted) out.push(d.embedding)
  }
  return out
}

export { embedOne, embedMany, EMBEDDING_MODEL }
