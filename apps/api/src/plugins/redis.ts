import fp from 'fastify-plugin'
import { createClient } from 'redis'
import { env } from '../env.js'

type RedisClient = ReturnType<typeof createClient>

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClient
  }
}

export const redisPlugin = fp(async (app) => {
  const client = createClient({ url: env.REDIS_URL })

  client.on('error', (err) => app.log.error({ err }, 'Redis client error'))

  await client.connect()

  app.decorate('redis', client)
  app.addHook('onClose', async () => {
    await client.quit()
  })
})
