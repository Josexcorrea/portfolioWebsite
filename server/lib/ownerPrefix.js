/**
 * Owner / interview mode: message must start with PORTFOLIO_OWNER_PREFIX (server env only).
 * Prefix is stripped for RAG, web search, and model input.
 */
export function parseOwnerPrefix(raw) {
  const prefix = (process.env.PORTFOLIO_OWNER_PREFIX || '').trim()
  const normalizedRaw = raw == null ? '' : String(raw)
  const trimmed = normalizedRaw.trimStart()
  if (prefix && trimmed.startsWith(prefix)) {
    const rest = trimmed.slice(prefix.length).trimStart()
    return { ownerMode: true, questionForRag: rest }
  }
  return { ownerMode: false, questionForRag: raw }
}
