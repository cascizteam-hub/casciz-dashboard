import { type NextRequest, NextResponse } from 'next/server'
import { cookieKeys } from '@/config'

const AUTH_ONLY = ['/overview', '/stores', '/settings', '/billing', '/team', '/builder', '/products', '/categories', '/checkout', '/orders']
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(cookieKeys.accessToken)?.value

  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (isAuthOnly && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
}
