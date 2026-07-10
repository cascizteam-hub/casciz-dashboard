'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth.api'
import { userApi } from '@/lib/api/user.api'
import { clearAuthCookies } from '@/lib/api/client'
import { getRefreshToken } from '@/lib/auth/token'
import { getErrorMessage } from '@/lib/utils'
import { useAuthStore } from '@/store/slices/auth.store'
import { routes } from '@/config'
import type { LoginRequest, RegisterRequest } from '@/types'

/**
 * Primary auth hook. All auth interactions in components go through here.
 */
export function useAuth() {
  const router    = useRouter()
  const { user, isLoading, isInitialized, setUser, setLoading, clearAuth } = useAuthStore()

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await userApi.getMe()
      if (data.data) setUser(data.data)
    } catch {
      clearAuth()
      clearAuthCookies()
    }
  }, [setUser, clearAuth])

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setLoading(true)
      try {
        await authApi.login(credentials)
        await fetchCurrentUser()
        router.push(routes.dashboard.overview)
      } finally {
        setLoading(false)
      }
    },
    [router, setLoading, fetchCurrentUser],
  )

  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      setLoading(true)
      try {
        await authApi.register(data)
      } finally {
        setLoading(false)
      }
    },
    [setLoading],
  )

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // Best-effort logout; clear cookies regardless
    } finally {
      clearAuth()
      clearAuthCookies()
      router.push(routes.auth.login)
    }
  }, [router, clearAuth])

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    fetchCurrentUser,
    getErrorMessage,
  }
}
