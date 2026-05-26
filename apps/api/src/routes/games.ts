import type { FastifyPluginAsync } from 'fastify'
import { UpsertGameSaveSchema } from '@fanfic/shared'
import { requireAuth } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'

export const gameRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAuth)

  app.get('/:projectId/saves', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { projectId } = req.params as { projectId: string }

    const project = await app.prisma.project.findFirst({
      where: { id: projectId, user_id: sub, is_deleted: false },
    })
    if (!project) return reply.status(404).send({ message: 'Project not found' })

    return app.prisma.gameSave.findMany({
      where: { user_id: sub, project_id: projectId },
      orderBy: { slot: 'asc' },
    })
  })

  app.put('/:projectId/saves/:slot', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { projectId, slot: slotStr } = req.params as { projectId: string; slot: string }
    const slot = parseInt(slotStr, 10)

    if (isNaN(slot) || slot < 1 || slot > 5) {
      return reply.status(400).send({ message: 'Slot must be 1–5' })
    }

    const project = await app.prisma.project.findFirst({
      where: { id: projectId, user_id: sub, is_deleted: false },
    })
    if (!project) return reply.status(404).send({ message: 'Project not found' })

    const body = UpsertGameSaveSchema.parse(req.body)

    const save = await app.prisma.gameSave.upsert({
      where: { user_id_project_id_slot: { user_id: sub, project_id: projectId, slot } },
      create: {
        user_id: sub,
        project_id: projectId,
        slot,
        ink_state: body.ink_state as object,
        scene_state: body.scene_state as object,
      },
      update: {
        ink_state: body.ink_state as object,
        scene_state: body.scene_state as object,
      },
    })

    return reply.status(200).send(save)
  })
}
