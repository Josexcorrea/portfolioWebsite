export function safeExternalHref(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

