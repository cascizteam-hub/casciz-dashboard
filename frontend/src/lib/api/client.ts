import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { appConfig, cookieKeys } from '@/config'
import type { ApiResponse, AuthTokens } from '@/types'

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(cookieKeys.accessToken)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch(Promise.reject)
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = Cookies.get(cookieKeys.refreshToken)

    if (!refreshToken) {
      clearAuthCookies()
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post<ApiResponse<AuthTokens>>(
        `${appConfig.apiBaseUrl}/auth/refresh`,
        { refreshToken },
      )

      if (data.data) {
        setAuthCookies(data.data.accessToken, data.data.refreshToken)
        processQueue(null, data.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
        return apiClient(originalRequest)
      }

      throw new Error('Refresh returned no tokens')
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthCookies()
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

const COOKIE_OPTIONS = {
  secure: false, // false for localhost
  sameSite: 'lax' as const, // lax works better for localhost
  path: '/',
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  Cookies.set(cookieKeys.accessToken, accessToken, { ...COOKIE_OPTIONS, expires: 1 })
  Cookies.set(cookieKeys.refreshToken, refreshToken, { ...COOKIE_OPTIONS, expires: 7 })
}

export function clearAuthCookies() {
  Cookies.remove(cookieKeys.accessToken, { path: '/' })
  Cookies.remove(cookieKeys.refreshToken, { path: '/' })
}

export default apiClient
