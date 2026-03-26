/**
 * Fetch public GitHub content for RAG at build time.
 * README alone is often thin; we also try architecture docs, manifests, and a few entry-point files.
 * Optional: server/knowledge/github-extra-paths.json → { "owner/repo": ["path/from/root.ts", ...] }
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchGithubFileText } from './githubContentFetch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge')
const EXTRA_PATHS_FILE = path.join(KNOWLEDGE_DIR, 'github-extra-paths.json')

/** Max characters stored per file (large files are truncated for embedding cost). */
export const MAX_CHARS_PER_FILE = 24_000

const BRANCHES = ['main', 'master']

/**
 * Tried after README for every repo (404 = skipped quietly).
 * Focus: structure, deps, and likely entry points — not full trees.
 */
export const DEFAULT_GITHUB_PATHS = [
  'ARCHITECTURE.md',
  'TECHNICAL.md',
  'docs/ARCHITECTURE.md',
  'docs/TECHNICAL.md',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'vite.config.ts',
  'vite.config.mts',
  'vite.config.js',
  'requirements.txt',
  'pyproject.toml',
  'src/main.tsx',
  'src/main.ts',
  'src/index.tsx',
  'src/index.ts',
  'src/App.tsx',
  'server/index.js',
  'server/createServer.js',
  'app.py',
]

function truncate(text, max = MAX_CHARS_PER_FILE) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}\n\n[…truncated for RAG indexing; see full file on GitHub]`
}

/**
 * Collect unique owner/repo pairs from any `https://github.com/owner/repo` URL in documents.
 */
function sanitizeGithubSegment(raw) {
  return String(raw || '')
    .replace(/[.,;:!?)]+$/g, '')
    .replace(/^[(]+/g, '')
    .trim()
}

/**
 * Extract owner/repo from GitHub URLs in document text.
 * Strips trailing punctuation (e.g. `.../repo.` at end of a sentence).
 */
export function extractGithubReposFromDocuments(documents) {
  const seen = new Set()
  const list = []
  const re = /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/|\s|[.,;:!?)]|$)/g
  for (const d of documents) {
    const text = d.content || ''
    let m
    re.lastIndex = 0
    while ((m = re.exec(text)) !== null) {
      const owner = sanitizeGithubSegment(m[1])
      const repo = sanitizeGithubSegment(m[2])
      if (!owner || !repo) continue
      const key = `${owner}/${repo}`
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ owner, repo })
    }
  }
  return list
}

function loadPerRepoExtraPaths() {
  if (!existsSync(EXTRA_PATHS_FILE)) return {}
  try {
    const raw = readFileSync(EXTRA_PATHS_FILE, 'utf8')
    const j = JSON.parse(raw)
    if (j && typeof j === 'object' && !Array.isArray(j)) return j
  } catch {
    /* ignore */
  }
  return {}
}

async function fetchRawOnce(owner, repo, branch, filePath) {
  return fetchGithubFileText(owner, repo, branch, filePath, { timeoutMs: 20000 })
}

/**
 * Try main then master.
 */
export async function fetchGithubFile(owner, repo, filePath) {
  for (const branch of BRANCHES) {
    const text = await fetchRawOnce(owner, repo, branch, filePath)
    if (text) return { text, branch }
  }
  return null
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * @returns {Promise<Array<{ title: string, content: string }>>}
 */
export async function fetchGithubRepoDocuments(documents, options = {}) {
  const { onProgress } = options

  const disabled =
    process.env.GITHUB_FETCH_REPO === '0' ||
    process.env.GITHUB_FETCH_REPO === 'false' ||
    process.env.GITHUB_FETCH_READMES === '0' ||
    process.env.GITHUB_FETCH_READMES === 'false'

  if (disabled) {
    console.log('Skipping GitHub fetch (GITHUB_FETCH_REPO / GITHUB_FETCH_READMES disabled).')
    return []
  }

  if (process.env.GITHUB_FULL_TREE === '1' || process.env.GITHUB_FULL_TREE === 'true') {
    console.log('Skipping partial GitHub file list (GITHUB_FULL_TREE uses full-tree index instead).')
    return []
  }

  const repos = extractGithubReposFromDocuments(documents)
  if (repos.length === 0) return []

  const perRepoExtras = loadPerRepoExtraPaths()
  const out = []
  const delayMs = parseInt(process.env.GITHUB_FETCH_DELAY_MS || '80', 10)

  for (const { owner, repo } of repos) {
    const key = `${owner}/${repo}`
    const customPaths = (
      Array.isArray(perRepoExtras[key]) ? perRepoExtras[key].filter((p) => typeof p === 'string' && p.trim()) : []
    ).slice(0, 20)

    /** Order: README → your custom paths → defaults (code/config for in-depth RAG). */
    const seenPath = new Set()
    const ordered = []
    const add = (p) => {
      if (!p || seenPath.has(p)) return
      seenPath.add(p)
      ordered.push(p)
    }
    add('README.md')
    for (const p of customPaths) add(p)
    for (const p of DEFAULT_GITHUB_PATHS) add(p)

    /** Only DEFAULT_GITHUB_PATHS count toward this cap (README + custom paths are always tried). */
    const maxDefaultPaths = parseInt(process.env.GITHUB_MAX_FILES_PER_REPO || '12', 10)
    let defaultPathsFetched = 0
    const fetched = []

    for (const filePath of ordered) {
      if (
        filePath !== 'README.md' &&
        DEFAULT_GITHUB_PATHS.includes(filePath) &&
        defaultPathsFetched >= maxDefaultPaths
      ) {
        break
      }

      const result = await fetchGithubFile(owner, repo, filePath)
      await sleep(delayMs)

      if (!result) continue

      if (filePath !== 'README.md' && DEFAULT_GITHUB_PATHS.includes(filePath)) {
        defaultPathsFetched += 1
      }

      const body = truncate(result.text)
      const label =
        filePath === 'README.md'
          ? `GitHub README: ${key}`
          : `GitHub file ${filePath}: ${key}`

      out.push({
        title: label,
        content: `Source: https://github.com/${owner}/${repo}/blob/${result.branch}/${filePath}\nRepository: https://github.com/${owner}/${repo}\n\n${body}`,
      })
      fetched.push(`${filePath}(${body.length}c)`)
      onProgress?.({ owner, repo, filePath, ok: true, chars: body.length })
    }

    if (fetched.length === 0) {
      console.warn(
        `GitHub ${key}: no files could be fetched (private repo, wrong branch, or no matching paths).`,
      )
    } else {
      console.log(`GitHub ${key}: ${fetched.join(', ')}`)
    }
  }

  return out
}
