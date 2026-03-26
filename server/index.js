import 'dotenv/config'
import { createServer } from './createServer.js'
import { ensureEmbeddings } from './scripts/ensure-embeddings.js'

await ensureEmbeddings()

const { app, port } = createServer()

app.listen(port, () => {
  console.log(`Chat API running at http://localhost:${port}`)
})
