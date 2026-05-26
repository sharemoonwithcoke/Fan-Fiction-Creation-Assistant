import type { FastifyPluginAsync } from 'fastify'
import multipart from '@fastify/multipart'
import { AssetQuerySchema } from '@fanfic/shared'
import { requireAuth } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { env } from '../env.js'

const EXPORT_RATE_LIMIT = { max: 20, timeWindow: '1 minute' }

export const assetRoutes: FastifyPluginAsync = async (app) => {
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } })
  app.addHook('preHandler', requireAuth)

  app.get('/', async (req) => {
    const { sub } = req.user as JwtPayload
    const query = AssetQuerySchema.parse(req.query)
    return app.prisma.asset.findMany({
      where: {
        user_id: sub,
        ...(query.type ? { type: query.type } : {}),
        ...(query.project_id ? { project_id: query.project_id } : {}),
      },
      orderBy: { created_at: 'desc' },
    })
  })

  app.post(
    '/upload',
    { config: { rateLimit: EXPORT_RATE_LIMIT } },
    async (req, reply) => {
      const { sub } = req.user as JwtPayload
      const data = await req.file()
      if (!data) return reply.status(400).send({ message: 'No file provided' })

      const assetType = (req.query as { type?: string }).type ?? 'sprite'
      const projectId = (req.query as { project_id?: string }).project_id ?? null

      // Stream to COS if configured, otherwise return a stub URL
      let url: string
      let size = 0

      if (env.COS_BUCKET && env.COS_SECRET_ID) {
        const { default: COS } = await import('@tencent-cloud/cos-node-sdk')
        const cos = new COS({ SecretId: env.COS_SECRET_ID, SecretKey: env.COS_SECRET_KEY! })
        const key = `uploads/${sub}/${Date.now()}-${data.filename}`
        const chunks: Buffer[] = []
        for await (const chunk of data.file) chunks.push(chunk as Buffer)
        const buffer = Buffer.concat(chunks)
        size = buffer.length

        await new Promise<void>((resolve, reject) => {
          cos.putObject(
            { Bucket: env.COS_BUCKET!, Region: env.COS_REGION, Key: key, Body: buffer },
            (err) => (err ? reject(err) : resolve()),
          )
        })

        url = env.COS_CDN_BASE ? `${env.COS_CDN_BASE}/${key}` : `https://${env.COS_BUCKET}.cos.${env.COS_REGION}.myqcloud.com/${key}`
      } else {
        // Dev fallback: consume stream, return placeholder
        for await (const chunk of data.file) size += (chunk as Buffer).length
        url = `/dev-assets/${Date.now()}-${data.filename}`
      }

      const asset = await app.prisma.asset.create({
        data: {
          user_id: sub,
          project_id: projectId,
          type: assetType as 'sprite' | 'background' | 'music' | 'avatar' | 'font',
          name: data.filename,
          url,
          size_bytes: size,
          mime_type: data.mimetype,
        },
      })

      return reply.status(201).send(asset)
    },
  )

  app.delete('/:id', async (req, reply) => {
    const { sub } = req.user as JwtPayload
    const { id } = req.params as { id: string }

    const asset = await app.prisma.asset.findFirst({ where: { id, user_id: sub } })
    if (!asset) return reply.status(404).send({ message: 'Not found' })

    await app.prisma.asset.delete({ where: { id } })
    return reply.status(204).send()
  })
}
