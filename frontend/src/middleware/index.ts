import { type NextRequest, NextResponse } from 'next/server'
import { cookieKeys, routes } from '@/config'

/**
 * Edge middleware that protects dashboard routes.
 * Redirects unauthenticated users to /login and authenticated users
 * away from auth pages to the dashboard.
 */

const PUBLIC_PATHS = new Set([
  routes.auth.login,
  routes.auth.register,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
  '/verify-email',
])

const AUTH_ONLY_PATHS = ['/overview', '/stores', '/settings', '/billing', '/team', '/builder', '/products', '/categories', '/checkout', '/orders']

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken  = request.cookies.get(cookieKeys.accessToken)?.value

  // If accessing a protected route without a token → login
  if (isAuthOnlyPath(pathname) && !accessToken) {
    const loginUrl = new URL(routes.auth.login, request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing a public auth page while already signed in → dashboard
  if (isPublicPath(pathname) && accessToken && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL(routes.dashboard.overview, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|fonts).*)',
  ],
}
