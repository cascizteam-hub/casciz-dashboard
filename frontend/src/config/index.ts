// ─────────────────────────────────────────────────────────────────────────────
// Casciz Commerce OS – Frontend App Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const appConfig = {
  name:       process.env.NEXT_PUBLIC_APP_NAME    ?? 'Casciz Commerce OS',
  url:        process.env.NEXT_PUBLIC_APP_URL      ?? 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1',
} as const

export const routes = {
  auth: {
    login:          '/login',
    register:       '/register',
    forgotPassword: '/forgot-password',
    resetPassword:  '/reset-password',
    verifyEmail:    '/verify-email',
  },
  dashboard: {
    overview: '/overview',
    stores:   '/stores',
    settings: '/settings',
    billing:  '/billing',
    team:     '/team',
  },
} as const

export const cookieKeys = {
  accessToken:  'casciz_access_token',
  refreshToken: 'casciz_refresh_token',
} as const
