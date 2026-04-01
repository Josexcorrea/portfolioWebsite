import { embedOne } from '../lib/embed.js'

/**
 * Append retrieval hints for acronym / domain keywords so embeddings align better with indexed chunks.
 */
const RETRIEVAL_QUERY_EXPANSIONS = [
  { match: /\bfsae\b|formula sae/i, hint: 'Formula SAE racing vehicle engineering' },
  { match: /\bpdm\b|power distribution module|power distribution\b/i, hint: 'Power Distribution Module vehicle electrical' },
  { match: /\becu\b/i, hint: 'engine control unit embedded' },
  { match: /\bcan bus\b|canbus/i, hint: 'CAN bus automotive networking' },
  { match: /\btelemetry\b/i, hint: 'data acquisition sensors' },
  { match: /\brag\b|retrieval augmented/i, hint: 'retrieval augmented generation embeddings vector' },
  { match: /\bvercel\b|serverless/i, hint: 'deployment hosting' },
]

export function expandQueryForRetrieval(question) {
  if (!question || typeof question !== 'string') return question
  const q = question.trim()
  const hints = []
  for (const { match, hint } of RETRIEVAL_QUERY_EXPANSIONS) {
    if (match.test(q)) hints.push(hint)
  }
  if (hints.length === 0) return q
  return `${q} ${[...new Set(hints)].join(' ')}`.trim()
}

export function buildRagContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return (
      '(Portfolio RAG did not retrieve a matching passage for this query—often rephrase or run `npm run build-knowledge` after updating knowledge. ' +
      'For questions about Jose’s work, answer from web search if provided; otherwise say you don’t have that detail in the indexed knowledge and suggest the Experience & Projects section on the site (and the Power Distribution Module research PDF in Projects).)'
    )
  }
  const header =
    'Each block is a retrievable source. Tags [S1], [S2], … are stable for this turn — use them when you quote.\n\n'
  const blocks = chunks.map((c, i) => {
    const tag = `S${i + 1}`
    return `### [${tag}] ${c.documentTitle}\nPassage (verbatim from the knowledge index):\n${c.chunkText}`
  })
  return header + blocks.join('\n\n---\n\n')
}

export async function getRagContext({
  question,
  openai,
  store,
  topK,
  minScore,
}) {
  const queryForEmbed = expandQueryForRetrieval(question)
  const queryEmbedding = await embedOne(queryForEmbed, openai)
  const scored = await store.search(queryEmbedding, { topK, minScore, includeScores: true })
  const maxScore =
    scored.length > 0 ? Math.max(...scored.map((c) => (typeof c.score === 'number' ? c.score : 0))) : 0
  const chunks = scored.map(({ chunkText, documentTitle }) => ({ chunkText, documentTitle }))
  return { chunks, context: buildRagContext(chunks), maxScore }
}

