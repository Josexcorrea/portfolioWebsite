const DEFAULT_MAX_BLOCK_TOKENS = 300

function isSafeExternalUrl(raw) {
  if (typeof raw !== 'string') return false
  const trimmed = raw.trim()
  if (!trimmed) return false

  try {
    const u = new URL(trimmed)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return []

  return blocks
    .map((b) => {
      if (!b || typeof b !== 'object') return null

      if (b.type === 'linkCard') {
        if (!isSafeExternalUrl(b.url)) return null
        return {
          type: 'linkCard',
          title: typeof b.title === 'string' ? b.title : 'Link',
          url: b.url.trim(),
          description: typeof b.description === 'string' ? b.description : undefined,
        }
      }

      if (b.type === 'callout') {
        const tone = b.tone === 'warning' ? 'warning' : 'info'
        const text = typeof b.text === 'string' ? b.text : ''
        if (!text.trim()) return null
        return { type: 'callout', tone, text }
      }

      if (b.type === 'example') {
        const links = Array.isArray(b.links)
          ? b.links
              .filter((l) => l && typeof l === 'object' && isSafeExternalUrl(l.url))
              .map((l) => ({
                label: typeof l.label === 'string' ? l.label : 'Link',
                url: l.url.trim(),
              }))
          : undefined

        const code =
          b.code && typeof b.code === 'object' && typeof b.code.text === 'string'
            ? {
                language: typeof b.code.language === 'string' ? b.code.language : undefined,
                text: b.code.text,
              }
            : undefined

        const steps = Array.isArray(b.steps)
          ? b.steps.filter((s) => typeof s === 'string').slice(0, 6)
          : undefined

        return {
          type: 'example',
          title: typeof b.title === 'string' ? b.title : undefined,
          summary: typeof b.summary === 'string' ? b.summary : undefined,
          steps,
          code,
          links: links && links.length > 0 ? links : undefined,
        }
      }

      return null
    })
    .filter(Boolean)
}

export function shouldGenerateExampleBlocks(question) {
  const q = (question || '').toLowerCase()
  return (
    q.includes('example') ||
    q.includes('show me') ||
    q.includes('how do i') ||
    q.includes('how to') ||
    q.includes('code') ||
    q.includes('snippet') ||
    q.includes('steps')
  )
}

export async function generateBlocks({ question, answer, openaiClient, model, maxTokens = DEFAULT_MAX_BLOCK_TOKENS }) {
  const prompt = `You generate UI blocks for a portfolio chat widget.\n\nReturn STRICT JSON only (no markdown, no prose), with this shape:\n{\n  \"blocks\": [\n    {\n      \"type\": \"example\",\n      \"title\": \"string (optional)\",\n      \"summary\": \"string (optional)\",\n      \"steps\": [\"string\"],\n      \"code\": {\"language\":\"string(optional)\",\"text\":\"string\"},\n      \"links\": [{\"label\":\"string\",\"url\":\"string\"}]\n    }\n  ]\n}\n\nRules:\n- Output valid JSON.\n- Only include fields that add value.\n- If there is no useful example to show, return {\"blocks\":[]}.\n- Keep steps <= 6.\n- Keep code short and directly relevant.\n- Use https URLs only.\n\nQuestion:\n${question}\n\nAssistant answer:\n${answer}\n`

  const resp = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Return only strict JSON. No markdown.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
  })

  const raw = resp.choices?.[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(raw)
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : []
    return sanitizeBlocks(blocks)
  } catch {
    return []
  }
}

