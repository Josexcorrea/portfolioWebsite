/**
 * Build RAG knowledge: chunk documents, generate embeddings, save to file store.
 * Uses:
 *   - server/knowledge/documents.json (structured short entries)
 *   - GitHub: optional full tree (GITHUB_FULL_TREE) or partial file list (githubRepoFetch.js)
 *   - server/knowledge/sources/*.txt, *.md, *.docx, *.pdf
 * Run from repo root: npm run sync-knowledge && npm run build-knowledge
 * Requires: OPENAI_API_KEY, network for GitHub fetch (set GITHUB_FETCH_REPO=false to skip). Optional GITHUB_TOKEN for rate limits / private repos.
 */
import 'dotenv/config'
import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mammoth from 'mammoth'
import pdf from 'pdf-parse'
import { chunkDocuments } from '../lib/chunk.js'
import { embedMany, getOpenAI } from '../lib/embed.js'
import { createFileVectorStore } from '../lib/vectorStore.js'
import { fetchGithubRepoDocuments } from '../lib/githubRepoFetch.js'
import { fetchGithubFullTreeDocuments } from '../lib/githubFullTreeIndex.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge')
const DOCUMENTS_PATH = path.join(KNOWLEDGE_DIR, 'documents.json')
const SOURCES_DIR = path.join(KNOWLEDGE_DIR, 'sources')
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public')

/** Load documents from documents.json */
function loadJsonDocuments() {
  const raw = readFileSync(DOCUMENTS_PATH, 'utf8')
  return JSON.parse(raw)
}

/**
 * Load documents from sources folder: .txt, .md, .docx (Word), .pdf.
 * Title = filename without extension (e.g. "pdm-research-paper").
 */
async function loadSourceDocuments() {
  if (!existsSync(SOURCES_DIR)) return []
  const files = readdirSync(SOURCES_DIR)
  const docs = []
  for (const file of files) {
    if (file.toLowerCase() === 'readme.md') continue
    const ext = path.extname(file).toLowerCase()
    const filePath = path.join(SOURCES_DIR, file)
    const title = path.basename(file, ext).replace(/-/g, ' ')

    if (ext === '.txt' || ext === '.md') {
      const content = readFileSync(filePath, 'utf8').trim()
      if (content) docs.push({ title, content })
      continue
    }

    if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: filePath })
        const content = (result.value || '').trim()
        if (content) docs.push({ title, content })
        else console.warn(`No text extracted from ${file}`)
      } catch (err) {
        console.warn(`Skipping ${file}: ${err.message}`)
      }
      continue
    }

    if (ext === '.pdf') {
      try {
        const dataBuffer = readFileSync(filePath)
        const data = await pdf(dataBuffer)
        const content = (data.text || '').trim()
        if (content) docs.push({ title, content })
        else console.warn(`No text extracted from ${file}`)
      } catch (err) {
        console.warn(`Skipping ${file}: ${err.message}`)
      }
    }
  }
  return docs
}

/**
 * Load documents from public folder:
 * - Used so PDFs you already expose on the site (e.g. Pdm-report.pdf) can be indexed for RAG.
 * - Title = filename without extension (e.g. "pdm-report").
 */
async function loadPublicPdfDocuments() {
  if (!existsSync(PUBLIC_DIR)) return []

  const files = readdirSync(PUBLIC_DIR)
  const docs = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    if (ext !== '.pdf') continue
    if (file.toLowerCase() === 'readme.md') continue

    const filePath = path.join(PUBLIC_DIR, file)
    const title = path.basename(file, ext).replace(/-/g, ' ')

    try {
      const dataBuffer = readFileSync(filePath)
      const data = await pdf(dataBuffer)
      const content = (data.text || '').trim()
      if (content) docs.push({ title, content })
      else console.warn(`No text extracted from public/${file}`)
    } catch (err) {
      console.warn(`Skipping public/${file}: ${err.message}`)
    }
  }

  return docs
}

async function main() {
  const tok = process.env.GITHUB_TOKEN
  if (tok === 'your_token_here' || tok === 'ghp_your_token_here') {
    console.warn(
      '[build-knowledge] GITHUB_TOKEN looks like a placeholder; replace it with a real PAT from https://github.com/settings/tokens',
    )
  }
  const fullTreeOn =
    process.env.GITHUB_FULL_TREE === '1' || process.env.GITHUB_FULL_TREE === 'true'
  console.log(
    `[build-knowledge] GITHUB_TOKEN: ${tok && tok !== 'your_token_here' ? 'set' : 'missing or placeholder'}, GITHUB_FULL_TREE: ${fullTreeOn}`,
  )

  const jsonDocs = loadJsonDocuments()
  const githubFullTreeDocs = await fetchGithubFullTreeDocuments(jsonDocs)
  const githubDocs = await fetchGithubRepoDocuments(jsonDocs)
  const sourceDocs = await loadSourceDocuments()
  const publicPdfDocs = await loadPublicPdfDocuments()
  const documents = [...jsonDocs, ...githubFullTreeDocs, ...githubDocs, ...sourceDocs, ...publicPdfDocs]

  console.log(
    `Loaded ${jsonDocs.length} from documents.json, ${githubFullTreeDocs.length} from GitHub full-tree, ${githubDocs.length} from GitHub partial, ${sourceDocs.length} from sources/., ${publicPdfDocs.length} from public/*.pdf.`,
  )
  if (documents.length === 0) {
    console.log('No documents to process. Add entries to documents.json or files in knowledge/sources/.')
    return
  }

  const chunks = chunkDocuments(documents)
  console.log(`Chunked ${documents.length} documents into ${chunks.length} chunks.`)

  const openai = getOpenAI()
  const texts = chunks.map((c) => c.chunkText)
  console.log('Generating embeddings...')
  const embeddings = await embedMany(texts, openai)
  console.log(`Got ${embeddings.length} embeddings.`)

  const records = chunks.map((c, i) => ({
    id: `chunk-${i}`,
    chunkText: c.chunkText,
    documentTitle: c.documentTitle,
    embedding: embeddings[i],
  }))

  const store = createFileVectorStore()
  await store.save(records)
  console.log('Saved to server/knowledge/embeddings.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
