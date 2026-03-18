const MAX_MESSAGES = 30
const MAX_CONTENT_LENGTH = 4000

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return null
  if (messages.length > MAX_MESSAGES) return null
  return messages
    .map((m) => {
      if (!m || typeof m !== 'object') return null
      const role = m.role === 'user' || m.role === 'assistant' ? m.role : null
      const content = typeof m.content === 'string' ? m.content.slice(0, MAX_CONTENT_LENGTH) : ''
      return role ? { role, content } : null
    })
    .filter(Boolean)
}

