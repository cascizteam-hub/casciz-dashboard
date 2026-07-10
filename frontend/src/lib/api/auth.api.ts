import apiClient, { clearAuthCookies, setAuthCookies } from './client'
import type {
  ApiResponse,
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types'

// ── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
  register(data: RegisterRequest) {
    return apiClient.post<ApiResponse<void>>('/auth/register', data)
  },

  verifyEmail(data: VerifyEmailRequest) {
    return apiClient.post<ApiResponse<void>>('/auth/verify-email', data)
  },

  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data)
    const tokens = response.data.data!
    setAuthCookies(tokens.accessToken, tokens.refreshToken)
    return tokens
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post('/auth/logout', { refreshToken })
    } finally {
      clearAuthCookies()
    }
  },

  forgotPassword(data: ForgotPasswordRequest) {
    return apiClient.post<ApiResponse<void>>('/auth/forgot-password', data)
  },

  resetPassword(data: ResetPasswordRequest) {
    return apiClient.post<ApiResponse<void>>('/auth/reset-password', data)
  },
}
