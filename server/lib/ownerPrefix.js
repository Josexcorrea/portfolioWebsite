/**
 * Owner / interview mode: message must start with PORTFOLIO_OWNER_PREFIX (server env only).
 * Prefix is stripped for RAG, web search, and model input.
 */
export function parseOwnerPrefix(raw) {
  const prefix = (process.env.PORTFOLIO_OWNER_PREFIX || '').trim()
  if (!prefix) {
    return { ownerMode: false, questionForRag: raw }
  }
  const trimmed = String(raw || '').trimStart()
  if (!trimmed.startsWith(prefix)) {
    return { ownerMode: false, questionForRag: raw }
  }
  const rest = trimmed.slice(prefix.length).trimStart()
  return { ownerMode: true, questionForRag: rest }
}
