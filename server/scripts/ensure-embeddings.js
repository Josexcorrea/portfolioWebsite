/**
 * Ensures `server/knowledge/embeddings.json` exists before the server starts.
 *
 * - Builds automatically only when:
 *   - `OPENAI_API_KEY` is present
 *   - and either `NODE_ENV !== 'production'` or `ENSURE_EMBEDDINGS_ON_START === 'true'`
 * - Does nothing if embeddings already exist.
 */
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge')
const EMBEDDINGS_PATH = path.join(KNOWLEDGE_DIR, 'embeddings.json')

function shouldAutoBuild() {
  if (process.env.ENSURE_EMBEDDINGS_ON_START === 'true') return true
  return process.env.NODE_ENV !== 'production'
}

export async function ensureEmbeddings() {
  if (existsSync(EMBEDDINGS_PATH)) return false
  if (!shouldAutoBuild()) return false
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[chat] embeddings.json missing, but OPENAI_API_KEY is not set; chat will be unavailable until you configure it and build knowledge.')
    return false
  }

  const buildScript = path.join(__dirname, 'build-knowledge.js')
  console.log('[chat] embeddings.json missing; building knowledge (this may take a while)...')

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [buildScript], {
      stdio: 'inherit',
      env: process.env,
    })
    child.on('exit', (code) => {
      if (code === 0) resolve(true)
      else reject(new Error(`build-knowledge exited with code ${code}`))
    })
    child.on('error', reject)
  })

  return true
}

