import { useMemo } from 'react'
import { createApiClient } from '@fanfic/shared'
import { useAuthStore } from '../store/auth.js'

export function useApi() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)

  return useMemo(
    () =>
      createApiClient({
        baseUrl: '/api/v1',
        getToken: () => accessToken,
        onUnauthorized: logout,
      }),
    [accessToken, logout],
  )
}
