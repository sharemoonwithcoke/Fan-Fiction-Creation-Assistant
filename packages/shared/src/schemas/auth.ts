import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  nickname: z.string().min(1).max(50),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const WechatLoginSchema = z.object({
  code: z.string().min(1),
})

export const RefreshTokenSchema = z.object({
  refresh_token: z.string(),
})

export const MigrateSchema = z.object({
  guest_token: z.string().uuid(),
  projects: z.array(z.unknown()),
  assets: z.array(z.unknown()),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type WechatLoginInput = z.infer<typeof WechatLoginSchema>
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
export type MigrateInput = z.infer<typeof MigrateSchema>
