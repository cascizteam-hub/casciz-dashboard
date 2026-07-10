import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

export const metadata: Metadata = {
  title: {
    default:  'Dashboard',
    template: '%s | Casciz Commerce OS',
  },
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
