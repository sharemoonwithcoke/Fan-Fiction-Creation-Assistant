import type { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { RegisterSchema, LoginSchema, WechatLoginSchema, RefreshTokenSchema, MigrateSchema } from '@fanfic/shared'
import { requireAuth } from '../middleware/auth.js'
import { env } from '../env.js'
import type { JwtPayload } from '../middleware/auth.js'

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Issue a guest token on first load
  app.post('/guest', async (_req, reply) => {
    const expiresAt = new Date(Date.now() + env.JWT_GUEST_EXPIRES_SECONDS * 1000)
    const guestRecord = await app.prisma.guestToken.create({
      data: { expires_at: expiresAt },
    })

    const token = app.jwt.sign(
      { sub: guestRecord.token, type: 'guest' },
      { expiresIn: env.JWT_GUEST_EXPIRES_SECONDS },
    )

    await app.redis.setEx(
      `guest:${guestRecord.token}`,
      env.JWT_GUEST_EXPIRES_SECONDS,
      '1',
    )

    return reply.status(201).send({
      guest_token: token,
      expires_in: env.JWT_GUEST_EXPIRES_SECONDS,
    })
  })

  app.post('/register', async (req, reply) => {
    const body = RegisterSchema.parse(req.body)

    const existing = await app.prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return reply.status(409).send({ message: 'Email already registered' })

    const password_hash = await bcrypt.hash(body.password, 12)
    const user = await app.prisma.user.create({
      data: { email: body.email, password_hash, nickname: body.nickname },
    })

    return reply.status(201).send(await issueTokenPair(app, user.id, user.role))
  })

  app.post('/login', async (req, reply) => {
    const body = LoginSchema.parse(req.body)
    const user = await app.prisma.user.findUnique({ where: { email: body.email } })

    if (!user || !user.password_hash) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(body.password, user.password_hash)
    if (!valid) return reply.status(401).send({ message: 'Invalid credentials' })

    return issueTokenPair(app, user.id, user.role)
  })

  app.post('/wechat', async (req, reply) => {
    const body = WechatLoginSchema.parse(req.body)

    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}&js_code=${body.code}&grant_type=authorization_code`,
    )
    const wxData = (await wxRes.json()) as { openid?: string; errcode?: number }

    if (!wxData.openid) {
      return reply.status(400).send({ message: 'WeChat login failed', detail: wxData })
    }

    const user = await app.prisma.user.upsert({
      where: { wechat_openid: wxData.openid },
      create: { wechat_openid: wxData.openid, nickname: '微信用户' },
      update: {},
    })

    return issueTokenPair(app, user.id, user.role)
  })

  app.post('/refresh', async (req, reply) => {
    const body = RefreshTokenSchema.parse(req.body)

    let payload: { sub: string }
    try {
      payload = app.jwt.verify<{ sub: string }>(body.refresh_token)
    } catch {
      return reply.status(401).send({ message: 'Invalid refresh token' })
    }

    const stored = await app.redis.get(`refresh:${payload.sub}`)
    if (!stored || stored !== body.refresh_token) {
      return reply.status(401).send({ message: 'Refresh token expired or revoked' })
    }

    const user = await app.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.status(401).send({ message: 'User not found' })

    await app.redis.del(`refresh:${payload.sub}`)
    return issueTokenPair(app, user.id, user.role)
  })

  app.post('/logout', { preHandler: requireAuth }, async (req, reply) => {
    const payload = req.user as JwtPayload
    await app.redis.del(`refresh:${payload.sub}`)
    await app.redis.setEx(`jti:blacklist:${payload.sub}`, 60 * 16, '1')
    return reply.status(204).send()
  })

  app.get('/me', { preHandler: requireAuth }, async (req) => {
    const payload = req.user as JwtPayload
    const user = await app.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } })
    return user
  })

  app.post('/migrate', async (req, reply) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing guest token' })
    }
    const rawToken = authHeader.slice(7)

    let guestPayload: JwtPayload
    try {
      guestPayload = app.jwt.verify<JwtPayload>(rawToken)
    } catch {
      return reply.status(401).send({ message: 'Invalid guest token' })
    }

    if (guestPayload.type !== 'guest') {
      return reply.status(400).send({ message: 'Not a guest token' })
    }

    const body = MigrateSchema.parse(req.body)
    const guestTokenId = guestPayload.sub

    const existing = await app.prisma.migrationLog.findFirst({
      where: { guest_token: guestTokenId, status: 'success' },
    })
    if (existing) return reply.status(409).send({ message: 'Already migrated' })

    const user = await app.prisma.user.findFirstOrThrow({
      where: { id: body.guest_token },
    }).catch(() => null)

    if (!user) return reply.status(400).send({ message: 'Target user not found' })

    let projectsMigrated = 0
    let assetsMigrated = 0

    await app.prisma.$transaction(async (tx) => {
      for (const p of body.projects) {
        const proj = p as { type: string; title: string; config: unknown }
        await tx.project.create({
          data: {
            user_id: user.id,
            type: proj.type as 'image' | 'forum' | 'game',
            title: proj.title,
            config: proj.config as object,
          },
        })
        projectsMigrated++
      }

      for (const a of body.assets) {
        const asset = a as { type: string; name: string; url: string; size_bytes: number; mime_type: string }
        await tx.asset.create({
          data: {
            user_id: user.id,
            type: asset.type as 'sprite' | 'background' | 'music' | 'avatar' | 'font',
            name: asset.name,
            url: asset.url,
            size_bytes: asset.size_bytes,
            mime_type: asset.mime_type,
          },
        })
        assetsMigrated++
      }

      await tx.migrationLog.create({
        data: {
          guest_token: guestTokenId,
          user_id: user.id,
          projects_migrated: projectsMigrated,
          assets_migrated: assetsMigrated,
          status: 'success',
        },
      })
    })

    await app.redis.del(`guest:${guestTokenId}`)

    return { projects_migrated: projectsMigrated, assets_migrated: assetsMigrated }
  })
}

async function issueTokenPair(
  app: Parameters<FastifyPluginAsync>[0],
  userId: string,
  role: string,
) {
  const accessToken = app.jwt.sign(
    { sub: userId, type: 'user', role } as JwtPayload,
    { expiresIn: env.JWT_ACCESS_EXPIRES },
  )

  const refreshToken = app.jwt.sign(
    { sub: userId, type: 'refresh' },
    { expiresIn: env.JWT_REFRESH_EXPIRES_SECONDS },
  )

  await app.redis.setEx(
    `refresh:${userId}`,
    env.JWT_REFRESH_EXPIRES_SECONDS,
    refreshToken,
  )

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 900,
  }
}
