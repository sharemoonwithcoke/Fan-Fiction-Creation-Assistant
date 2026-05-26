import type { FastifyPluginAsync } from 'fastify'
import { CreateTemplateSchema, TemplateQuerySchema } from '@fanfic/shared'
import { requireAuth } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'

export const templateRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireAuth }, async (req) => {
    const { sub } = req.user as JwtPayload
    const query = TemplateQuerySchema.parse(req.query)

    return app.prisma.template.findMany({
      where: {
        user_id: sub,
        ...(query.feature_type ? { feature_type: query.feature_type } : {}),
      },
      orderBy: { created_at: 'desc' },
    })
  })

  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const body = CreateTemplateSchema.parse(req.body)

    const template = await app.prisma.template.create({
      data: {
        user_id: sub,
        feature_type: body.feature_type,
        name: body.name,
        config: body.config as object,
      },
    })

    return reply.status(201).send(template)
  })

  app.delete('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { id } = req.params as { id: string }

    const template = await app.prisma.template.findFirst({
      where: { id, user_id: sub },
    })
    if (!template) return reply.status(404).send({ message: 'Not found' })

    await app.prisma.template.delete({ where: { id } })
    return reply.status(204).send()
  })
}
