export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  wechat_openid: string | null
  email: string | null
  nickname: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface GuestToken {
  token: string
  consumed_at: string | null
  expires_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface GuestAuthToken {
  guest_token: string
  expires_in: number
}
