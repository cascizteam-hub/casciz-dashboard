'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Settings,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { routes } from '@/config'

const NAV_ITEMS = [
  { href: routes.dashboard.overview, label: 'Overview',  icon: LayoutDashboard },
  { href: routes.dashboard.stores,   label: 'Stores',    icon: Store },
  { href: routes.dashboard.team,     label: 'Team',      icon: Users },
  { href: routes.dashboard.billing,  label: 'Billing',   icon: CreditCard },
  { href: routes.dashboard.settings, label: 'Settings',  icon: Settings },
] as const

interface Props {
  children: ReactNode
}

export default function DashboardShell({ children }: Props) {
  const pathname       = usePathname()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?'

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-surface-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-surface-0 border-r border-surface-200',
          'transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-200">
          <Link href={routes.dashboard.overview} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M4 6C4 4.895 4.895 4 6 4H10C11.105 4 12 4.895 12 6V10C12 11.105 11.105 12 10 12H6C4.895 12 4 11.105 4 10V6Z" fill="currentColor" fillOpacity="0.9"/>
                <path d="M14 14C14 12.895 14.895 12 16 12H18C19.105 12 20 12.895 20 14V18C20 19.105 19.105 20 18 20H16C14.895 20 14 19.105 14 18V14Z" fill="currentColor"/>
              </svg>
            </span>
            <span className="font-display font-semibold text-surface-900 text-base">Casciz</span>
          </Link>
          <button
            className="lg:hidden p-1 rounded-md text-surface-500 hover:text-surface-700"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  'transition-colors duration-150 group',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600',
                  )}
                  aria-hidden="true"
                />
                {label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary-400" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-200 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex-shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            <LogOut className="h-4 w-4 text-surface-400" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-surface-200 bg-surface-0 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href={routes.dashboard.overview} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white" aria-hidden="true">
                <path d="M4 6C4 4.895 4.895 4 6 4H10C11.105 4 12 4.895 12 6V10C12 11.105 11.105 12 10 12H6C4.895 12 4 11.105 4 10V6Z" fill="currentColor" fillOpacity="0.9"/>
                <path d="M14 14C14 12.895 14.895 12 16 12H18C19.105 12 20 12.895 20 14V18C20 19.105 19.105 20 18 20H16C14.895 20 14 19.105 14 18V14Z" fill="currentColor"/>
              </svg>
            </span>
            <span className="font-display font-semibold text-surface-900 text-sm">Casciz</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
