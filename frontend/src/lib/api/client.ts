import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { appConfig, cookieKeys } from '@/config'
import type { ApiResponse, AuthTokens } from '@/types'

// ── Axios instance ────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// ── Request interceptor: attach access token ──────────────────────────────

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

// ── Response interceptor: silent token refresh ────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

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

    // Don't try to refresh on auth endpoints themselves
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
      redirectToLogin()
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
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ── Cookie helpers ────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  Cookies.set(cookieKeys.accessToken,  accessToken,  { ...COOKIE_OPTIONS, expires: 1 / 96 }) // 15 min
  Cookies.set(cookieKeys.refreshToken, refreshToken, { ...COOKIE_OPTIONS, expires: 7 })       // 7 days
}

export function clearAuthCookies() {
  Cookies.remove(cookieKeys.accessToken)
  Cookies.remove(cookieKeys.refreshToken)
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export default apiClient
