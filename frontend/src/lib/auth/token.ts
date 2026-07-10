import Cookies from 'js-cookie'
import { cookieKeys } from '@/config'
import type { UserSummary } from '@/types'

/**
 * Decodes the JWT access token payload without verifying the signature.
 * Signature verification is performed by the backend on every API call.
 */
export function decodeAccessToken(token: string): Record<string, unknown> | null {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getAccessToken(): string | undefined {
  return Cookies.get(cookieKeys.accessToken)
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(cookieKeys.refreshToken)
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeAccessToken(token)
  if (!payload || typeof payload.exp !== 'number') return true
  // Add 10-second buffer
  return Date.now() / 1000 > payload.exp - 10
}

export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false
  return !isTokenExpired(token)
}

export function getUserFromToken(token: string): Partial<UserSummary> | null {
  const payload = decodeAccessToken(token)
  if (!payload) return null
  return {
    email: typeof payload.sub === 'string' ? payload.sub : undefined,
  }
}
