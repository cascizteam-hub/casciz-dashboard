'use client'

import { useCallback } from 'react'
import { authApi } from '@/lib/api/auth.api'
import { userApi } from '@/lib/api/user.api'
import { clearAuthCookies } from '@/lib/api/client'
import { getRefreshToken } from '@/lib/auth/token'
import { getErrorMessage } from '@/lib/utils'
import { useAuthStore } from '@/store/slices/auth.store'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useAuth() {
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
        if (typeof window !== 'undefined') {
          window.location.href = '/overview'
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, fetchCurrentUser],
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
      // best effort
    } finally {
      clearAuth()
      clearAuthCookies()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [clearAuth])

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
