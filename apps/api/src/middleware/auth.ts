import type { FastifyRequest, FastifyReply } from 'fastify'

export interface JwtPayload {
  sub: string
  type: 'user' | 'guest'
  role?: 'user' | 'admin'
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<JwtPayload>()
    const payload = request.user as JwtPayload

    const blacklisted = await request.server.redis.get(`jti:blacklist:${payload.sub}`)
    if (blacklisted) {
      return reply.status(401).send({ message: 'Token revoked' })
    }

    if (payload.type !== 'user') {
      return reply.status(403).send({ message: 'User authentication required' })
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function requireGuest(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<JwtPayload>()
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply)
  const payload = request.user as JwtPayload
  if (payload.role !== 'admin') {
    return reply.status(403).send({ message: 'Admin access required' })
  }
}
