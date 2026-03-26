/**
 * Fetch a file from GitHub: raw.githubusercontent.com first, then REST Contents API
 * when raw fails with 401/403/404 and GITHUB_TOKEN is set (private repos, some edge cases).
 */

const GITHUB_API = 'https://api.github.com'
const GITHUB_RAW = 'https://raw.githubusercontent.com'

const CONTENTS_MAX_BYTES = 10_000_000

function githubHeadersApi() {
  const token = process.env.GITHUB_TOKEN
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-build-knowledge',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function githubHeadersRaw() {
  const token = process.env.GITHUB_TOKEN
  const h = { 'User-Agent': 'portfolio-build-knowledge' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function fetchViaContentsApi(owner, repo, ref, filePath, maxBytes, timeoutMs) {
  const cap = maxBytes != null ? maxBytes : CONTENTS_MAX_BYTES
  const apiPath = filePath.split('/').map((seg) => encodeURIComponent(seg)).join('/')
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${apiPath}?ref=${encodeURIComponent(ref)}`
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: githubHeadersApi(), signal: controller.signal })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) || data.type !== 'file' || !data.content) return null
    if (typeof data.size === 'number' && data.size > cap) {
      return maxBytes != null ? `[skipped: file larger than ${maxBytes} bytes]` : null
    }
    const buf = Buffer.from(String(data.content).replace(/\n/g, ''), 'base64')
    if (buf.length > cap) {
      return maxBytes != null ? `[skipped: file larger than ${maxBytes} bytes]` : null
    }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buf)
    if (maxBytes == null) return text.trim() ? text : null
    return text
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/**
 * @param {string} owner
 * @param {string} repo
 * @param {string} ref branch or tag name
 * @param {string} filePath path within repo
 * @param {{ maxBytes?: number, timeoutMs?: number }} [options]
 * - maxBytes: if set, raw and decoded bodies above this yield null or a [skipped: …] string (full-tree mode)
 * - if maxBytes omitted, partial fetches use full raw text; Contents API responses are capped at 10MB
 * @returns {Promise<string | null>}
 */
export async function fetchGithubFileText(owner, repo, ref, filePath, options = {}) {
  const maxBytes = options.maxBytes
  const timeoutMs = options.timeoutMs ?? 60000
  const encoded = filePath.split('/').map((seg) => encodeURIComponent(seg)).join('/')
  const url = `${GITHUB_RAW}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${encoded}`
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: githubHeadersRaw(), signal: controller.signal })
    if (res.ok) {
      if (maxBytes != null) {
        const buf = await res.arrayBuffer()
        if (buf.byteLength > maxBytes) {
          return `[skipped: file larger than ${maxBytes} bytes]`
        }
        return new TextDecoder('utf-8', { fatal: false }).decode(buf)
      }
      const text = await res.text()
      return text.trim() ? text : null
    }
    const token = process.env.GITHUB_TOKEN
    if (!token) return null
    if (![401, 403, 404].includes(res.status)) return null
    return fetchViaContentsApi(owner, repo, ref, filePath, maxBytes, timeoutMs)
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}
