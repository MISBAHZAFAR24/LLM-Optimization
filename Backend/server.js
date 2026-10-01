import 'dotenv/config'
import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start the API.')
}
await connectDatabase()

const port = Number(process.env.PORT || 3000)
const server = app.listen(port, () => console.log(`Promptly API listening on http://127.0.0.1:${port}`))

async function shutdown() {
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
