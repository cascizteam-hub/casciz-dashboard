import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default:  'Sign in',
    template: '%s | Casciz Commerce OS',
  },
}

/**
 * Shared layout for all authentication pages.
 * Renders a centred split-panel: branding left, form right.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel: branding ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-950 px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden="true">
              <path
                d="M4 6C4 4.895 4.895 4 6 4H10C11.105 4 12 4.895 12 6V10C12 11.105 11.105 12 10 12H6C4.895 12 4 11.105 4 10V6Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
              <path
                d="M14 6C14 4.895 14.895 4 16 4H18C19.105 4 20 4.895 20 6V8C20 9.105 19.105 10 18 10H16C14.895 10 14 9.105 14 8V6Z"
                fill="currentColor"
                fillOpacity="0.6"
              />
              <path
                d="M4 16C4 14.895 4.895 14 6 14H8C9.105 14 10 14.895 10 16V18C10 19.105 9.105 20 8 20H6C4.895 20 4 19.105 4 18V16Z"
                fill="currentColor"
                fillOpacity="0.6"
              />
              <path
                d="M14 14C14 12.895 14.895 12 16 12H18C19.105 12 20 12.895 20 14V18C20 19.105 19.105 20 18 20H16C14.895 20 14 19.105 14 18V14Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-display font-semibold text-white text-lg tracking-tight">
            Casciz
          </span>
        </div>

        {/* Hero quote */}
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Your store,<br />
            your rules.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            Build a beautiful online store in minutes — no code, no limits,
            no compromises.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {['#6366f1','#14b8a6','#f59e0b','#ef4444'].map((color, i) => (
                <span
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-primary-950 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <p className="text-primary-300 text-sm">
              Join <span className="text-white font-semibold">12,000+</span> merchants
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-primary-500 text-xs">
          © {new Date().getFullYear()} Casciz Technologies. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12 bg-surface-0">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M4 6C4 4.895 4.895 4 6 4H10C11.105 4 12 4.895 12 6V10C12 11.105 11.105 12 10 12H6C4.895 12 4 11.105 4 10V6Z" fill="currentColor" fillOpacity="0.9"/>
                <path d="M14 14C14 12.895 14.895 12 16 12H18C19.105 12 20 12.895 20 14V18C20 19.105 19.105 20 18 20H16C14.895 20 14 19.105 14 18V14Z" fill="currentColor"/>
              </svg>
            </span>
            <span className="font-display font-semibold text-surface-900">Casciz</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
