import { buildApp } from './app.js'
import { env } from './env.js'

const app = await buildApp()

try {
  await app.listen({ port: env.PORT, host: env.HOST })
  console.log(`API server listening on ${env.HOST}:${env.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
