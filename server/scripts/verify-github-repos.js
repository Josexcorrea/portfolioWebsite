/**
 * Dry-run: which GitHub URLs are in documents.json and which paths resolve (no embeddings).
 * Usage: node server/scripts/verify-github-repos.js
 */
import 'dotenv/config'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  extractGithubReposFromDocuments,
  fetchGithubFile,
  DEFAULT_GITHUB_PATHS,
} from '../lib/githubRepoFetch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCUMENTS_PATH = path.join(__dirname, '..', 'knowledge', 'documents.json')

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  if (!existsSync(DOCUMENTS_PATH)) {
    console.error('Missing server/knowledge/documents.json — run: npm run sync-knowledge')
    process.exit(1)
  }
  const documents = JSON.parse(readFileSync(DOCUMENTS_PATH, 'utf8'))
  const repos = extractGithubReposFromDocuments(documents)

  console.log('Repos extracted from documents.json (same logic as build-knowledge):\n')
  for (const { owner, repo } of repos) {
    console.log(`  https://github.com/${owner}/${repo}`)
  }
  console.log('')

  for (const { owner, repo } of repos) {
    const key = `${owner}/${repo}`
    console.log(`=== ${key} ===`)
    const readme = await fetchGithubFile(owner, repo, 'README.md')
    await sleep(80)
    console.log(`  README.md          ${readme ? `OK (${readme.text.length} chars, ${readme.branch})` : '404 / empty'}`)
    for (const p of DEFAULT_GITHUB_PATHS) {
      const r = await fetchGithubFile(owner, repo, p)
      await sleep(80)
      console.log(`  ${p.padEnd(22)} ${r ? `OK (${r.text.length}c)` : '—'}`)
    }
    console.log('')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
