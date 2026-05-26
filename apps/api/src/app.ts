import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { env } from './env.js'
import { prismaPlugin } from './plugins/prisma.js'
import { redisPlugin } from './plugins/redis.js'
import { authRoutes } from './routes/auth.js'
import { projectRoutes } from './routes/projects.js'
import { assetRoutes } from './routes/assets.js'
import { gameRoutes } from './routes/games.js'
import { templateRoutes } from './routes/templates.js'

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
    ajv: { customOptions: { strict: false } },
  })

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  })

  await app.register(prismaPlugin)
  await app.register(redisPlugin)

  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(projectRoutes, { prefix: '/api/v1/projects' })
  await app.register(assetRoutes, { prefix: '/api/v1/assets' })
  await app.register(gameRoutes, { prefix: '/api/v1/games' })
  await app.register(templateRoutes, { prefix: '/api/v1/templates' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
