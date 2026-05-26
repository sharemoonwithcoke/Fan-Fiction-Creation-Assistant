import type { FastifyPluginAsync } from 'fastify'
import { CreateProjectSchema, UpdateProjectSchema } from '@fanfic/shared'
import { requireAuth } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (req) => {
    const { sub } = req.user as JwtPayload
    return app.prisma.project.findMany({
      where: { user_id: sub, is_deleted: false },
      orderBy: { updated_at: 'desc' },
    })
  })

  app.post('/', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const body = CreateProjectSchema.parse(req.body)
    const project = await app.prisma.project.create({
      data: {
        user_id: sub,
        type: body.type,
        title: body.title,
        config: body.config as object,
      },
    })
    return reply.status(201).send(project)
  })

  app.get('/:id', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { id } = req.params as { id: string }
    const project = await app.prisma.project.findFirst({
      where: { id, user_id: sub, is_deleted: false },
    })
    if (!project) return reply.status(404).send({ message: 'Not found' })
    return project
  })

  app.patch('/:id', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { id } = req.params as { id: string }
    const body = UpdateProjectSchema.parse(req.body)

    const existing = await app.prisma.project.findFirst({
      where: { id, user_id: sub, is_deleted: false },
    })
    if (!existing) return reply.status(404).send({ message: 'Not found' })

    return app.prisma.project.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.config ? { config: body.config as object } : {}),
      },
    })
  })

  app.delete('/:id', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { id } = req.params as { id: string }

    const existing = await app.prisma.project.findFirst({
      where: { id, user_id: sub, is_deleted: false },
    })
    if (!existing) return reply.status(404).send({ message: 'Not found' })

    await app.prisma.project.update({ where: { id }, data: { is_deleted: true } })
    return reply.status(204).send()
  })
}
