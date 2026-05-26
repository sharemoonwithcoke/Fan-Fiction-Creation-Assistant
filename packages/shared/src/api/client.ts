import type {
  User,
  AuthTokens,
  GuestAuthToken,
  Project,
  Asset,
  GameSave,
  Template,
} from '../types/index.js'
import type {
  RegisterInput,
  LoginInput,
  WechatLoginInput,
  RefreshTokenInput,
  MigrateInput,
  CreateProjectInput,
  UpdateProjectInput,
  AssetQueryInput,
  UpsertGameSaveInput,
  CreateTemplateInput,
  TemplateQueryInput,
} from '../schemas/index.js'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiClientConfig {
  baseUrl: string
  getToken: () => string | null
  onUnauthorized?: () => void
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    isMultipart = false,
  ): Promise<T> {
    const token = config.getToken()
    const headers: Record<string, string> = {}

    if (token) headers['Authorization'] = `Bearer ${token}`
    if (body && !isMultipart) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: isMultipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 401) {
      config.onUnauthorized?.()
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new ApiError(res.status, (data as { message?: string }).message ?? res.statusText, data)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  return {
    auth: {
      wechatLogin: (data: WechatLoginInput) =>
        request<AuthTokens>('POST', '/auth/wechat', data),
      register: (data: RegisterInput) =>
        request<AuthTokens>('POST', '/auth/register', data),
      login: (data: LoginInput) =>
        request<AuthTokens>('POST', '/auth/login', data),
      refresh: (data: RefreshTokenInput) =>
        request<AuthTokens>('POST', '/auth/refresh', data),
      logout: () =>
        request<void>('POST', '/auth/logout'),
      migrate: (data: MigrateInput) =>
        request<{ projects_migrated: number; assets_migrated: number }>('POST', '/auth/migrate', data),
      guestToken: () =>
        request<GuestAuthToken>('POST', '/auth/guest'),
      me: () =>
        request<User>('GET', '/auth/me'),
    },

    projects: {
      list: () =>
        request<Project[]>('GET', '/projects'),
      get: (id: string) =>
        request<Project>('GET', `/projects/${id}`),
      create: (data: CreateProjectInput) =>
        request<Project>('POST', '/projects', data),
      update: (id: string, data: UpdateProjectInput) =>
        request<Project>('PATCH', `/projects/${id}`, data),
      delete: (id: string) =>
        request<void>('DELETE', `/projects/${id}`),
    },

    assets: {
      list: (query?: AssetQueryInput) => {
        const params = query
          ? '?' + new URLSearchParams(query as Record<string, string>).toString()
          : ''
        return request<Asset[]>('GET', `/assets${params}`)
      },
      upload: (formData: FormData) =>
        request<Asset>('POST', '/assets/upload', formData, true),
      delete: (id: string) =>
        request<void>('DELETE', `/assets/${id}`),
    },

    games: {
      getSaves: (projectId: string) =>
        request<GameSave[]>('GET', `/games/${projectId}/saves`),
      upsertSave: (projectId: string, slot: number, data: UpsertGameSaveInput) =>
        request<GameSave>('PUT', `/games/${projectId}/saves/${slot}`, data),
    },

    templates: {
      list: (query?: TemplateQueryInput) => {
        const params = query
          ? '?' + new URLSearchParams(query as Record<string, string>).toString()
          : ''
        return request<Template[]>('GET', `/templates${params}`)
      },
      create: (data: CreateTemplateInput) =>
        request<Template>('POST', '/templates', data),
      delete: (id: string) =>
        request<void>('DELETE', `/templates/${id}`),
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
