/**
 * Full-tree GitHub index for RAG: recursive tree via GitHub API, filter blobs, fetch raw contents.
 * Writes github-tree-manifest.json (path → content SHA-256) for auditing repeat builds.
 */
import crypto from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchGithubFileText } from './githubContentFetch.js'
import { extractGithubReposFromDocuments } from './githubRepoFetch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge')
const MANIFEST_PATH = path.join(KNOWLEDGE_DIR, 'github-tree-manifest.json')

const GITHUB_API = 'https://api.github.com'

const DEFAULT_ALLOW_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.kt',
  '.kts',
  '.md',
  '.json',
  '.yml',
  '.yaml',
  '.css',
  '.scss',
  '.html',
  '.sql',
  '.sh',
  '.toml',
])

const DEFAULT_DENY_SEGMENTS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '__pycache__',
  '.next',
  '.nuxt',
  'vendor',
  'target',
  '.venv',
  'venv',
]

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-build-knowledge',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

function parseAllowExt() {
  const raw = process.env.GITHUB_FULL_TREE_ALLOW_EXT
  if (!raw || !raw.trim()) return DEFAULT_ALLOW_EXT
  const set = new Set(
    raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .map((x) => (x.startsWith('.') ? x : `.${x}`)),
  )
  return set.size ? set : DEFAULT_ALLOW_EXT
}

function parseDenySegments() {
  const raw = process.env.GITHUB_FULL_TREE_DENY_SEGMENTS
  if (!raw || !raw.trim()) return DEFAULT_DENY_SEGMENTS
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function shouldIndexPath(filePath, allowExt, denySegments) {
  const norm = filePath.replace(/\\/g, '/')
  const parts = norm.split('/')
  if (denySegments.some((seg) => parts.includes(seg))) return false
  const lower = norm.toLowerCase()
  const ext = path.posix.extname(norm).toLowerCase()
  if (lower.endsWith('.min.js') || lower.endsWith('.min.css')) return false
  if (!allowExt.has(ext)) return false
  return true
}

async function githubJson(apiPath) {
  const url = `${GITHUB_API}${apiPath}`
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 45000)
  try {
    const res = await fetch(url, { headers: githubHeaders(), signal: controller.signal })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`GitHub API ${res.status} ${apiPath}: ${errText.slice(0, 240)}`)
    }
    return res.json()
  } finally {
    clearTimeout(t)
  }
}

async function getDefaultBranchTreeSha(owner, repo) {
  const meta = await githubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
  const branchName = meta.default_branch || 'main'
  const ref = await githubJson(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branchName)}`,
  )
  const commitSha = ref.object?.sha
  if (!commitSha) throw new Error(`No commit SHA for ref heads/${branchName}`)
  const commit = await githubJson(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits/${commitSha}`,
  )
  const treeSha = commit.tree?.sha
  if (!treeSha) throw new Error('No tree SHA on commit')
  return { branchName, treeSha }
}

async function getRecursiveTree(owner, repo, treeSha) {
  const data = await githubJson(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${treeSha}?recursive=1`,
  )
  return data.tree || []
}

function saveManifest(manifest) {
  mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')
}

const MAX_CHARS = parseInt(process.env.GITHUB_FULL_TREE_MAX_CHARS || '48000', 10)

function truncateForEmbed(text) {
  const t = text.trim()
  if (t.length <= MAX_CHARS) return t
  return `${t.slice(0, MAX_CHARS)}\n\n[…truncated for RAG indexing]`
}

/**
 * @param {Array<{ title: string, content: string }>} documents
 * @returns {Promise<Array<{ title: string, content: string }>>}
 */
export async function fetchGithubFullTreeDocuments(documents) {
  const enabled = process.env.GITHUB_FULL_TREE === '1' || process.env.GITHUB_FULL_TREE === 'true'
  if (!enabled) {
    console.log('Full GitHub tree index disabled (set GITHUB_FULL_TREE=true to enable).')
    return []
  }

  if (
    process.env.GITHUB_FETCH_REPO === '0' ||
    process.env.GITHUB_FETCH_REPO === 'false' ||
    process.env.GITHUB_FETCH_READMES === '0' ||
    process.env.GITHUB_FETCH_READMES === 'false'
  ) {
    console.log('Skipping full GitHub tree (GITHUB_FETCH_REPO disabled).')
    return []
  }

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      'GITHUB_TOKEN is not set. Full-tree API calls may hit low rate limits; private repos will fail.',
    )
  }

  const repos = extractGithubReposFromDocuments(documents)
  if (repos.length === 0) return []

  const allowExt = parseAllowExt()
  const denySegments = parseDenySegments()
  const maxFiles = parseInt(process.env.GITHUB_FULL_TREE_MAX_FILES || '1500', 10)
  const delayMs = parseInt(process.env.GITHUB_FETCH_DELAY_MS || '50', 10)
  const maxFileBytes = parseInt(process.env.GITHUB_MAX_FILE_BYTES || '200000', 10)
  const nextManifest = {}

  const out = []

  for (const { owner, repo } of repos) {
    const keyPrefix = `${owner}/${repo}/`
    let branchName
    let treeEntries
    try {
      const r = await getDefaultBranchTreeSha(owner, repo)
      branchName = r.branchName
      treeEntries = await getRecursiveTree(owner, repo, r.treeSha)
    } catch (e) {
      console.warn(`Full-tree ${owner}/${repo}: ${e.message}`)
      continue
    }

    const blobs = treeEntries.filter((e) => e.type === 'blob' && e.path && shouldIndexPath(e.path, allowExt, denySegments))

    if (blobs.length > maxFiles) {
      console.warn(
        `Full-tree ${owner}/${repo}: ${blobs.length} files match filters; capping to ${maxFiles} (GITHUB_FULL_TREE_MAX_FILES).`,
      )
    }

    const toProcess = blobs.slice(0, maxFiles)
    let indexed = 0

    for (const entry of toProcess) {
      const filePath = entry.path
      const logicalKey = `${keyPrefix}${filePath}`

      await sleep(delayMs)

      const text = await fetchGithubFileText(owner, repo, branchName, filePath, {
        maxBytes: maxFileBytes,
        timeoutMs: 60000,
      })
      if (text == null || text.startsWith('[skipped:')) {
        continue
      }

      nextManifest[logicalKey] = sha256(text)

      const body = truncateForEmbed(text)
      out.push({
        title: `GitHub: ${owner}/${repo} — ${filePath}`,
        content: `Repository: https://github.com/${owner}/${repo}\nBranch: ${branchName}\nFile: ${filePath}\nSource: https://github.com/${owner}/${repo}/blob/${branchName}/${filePath.replace(/\\/g, '/')}\n\n${body}`,
      })
      indexed += 1
    }

    console.log(`Full-tree ${owner}/${repo}: indexed ${indexed} file(s) on ${branchName}.`)
  }

  saveManifest(nextManifest)
  console.log(`Wrote ${MANIFEST_PATH} (${Object.keys(nextManifest).length} paths).`)

  return out
}
