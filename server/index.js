import 'dotenv/config'
import { createServer } from './createServer.js'

const { app, port } = createServer()

app.listen(port, () => {
  console.log(`Chat API running at http://localhost:${port}`)
})
