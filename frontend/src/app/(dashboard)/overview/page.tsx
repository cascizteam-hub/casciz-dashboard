'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Rocket, Archive, FileText, Plus } from 'lucide-react'
import { storeApi } from '@/lib/api/store.api'
import { Skeleton } from '@/components/shared/Skeletons'
import type { StoreStatsResponse } from '@/types'
import { useAuthStore } from '@/store/slices/auth.store'

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats]       = useState<StoreStatsResponse | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    storeApi.getStats()
      .then(({ data }) => { if (data.data) setStats(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    {
      label: 'Total stores',
      value: stats?.totalStores,
      icon:  <Store className="h-5 w-5" />,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Published',
      value: stats?.publishedStores,
      icon:  <Rocket className="h-5 w-5" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Drafts',
      value: stats?.draftStores,
      icon:  <FileText className="h-5 w-5" />,
      color: 'bg-surface-100 text-surface-500',
    },
    {
      label: 'Archived',
      value: stats?.archivedStores,
      icon:  <Archive className="h-5 w-5" />,
      color: 'bg-surface-100 text-surface-400',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          {user ? `Welcome back, ${user.firstName}` : 'Overview'}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Here&apos;s what&apos;s happening across your stores.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{label}</p>
                {isLoading
                  ? <Skeleton className="mt-2 h-7 w-12" />
                  : <p className="mt-1.5 text-2xl font-bold text-surface-900">{value ?? 0}</p>}
              </div>
              <span className={`flex h-9 w-9 rounded-lg items-center justify-center flex-shrink-0 ${color}`}>
                {icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-surface-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/stores/new" className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> New store
          </Link>
          <Link href="/stores" className="btn-secondary text-sm">
            <Store className="h-4 w-4" /> View all stores
          </Link>
        </div>
      </div>
    </div>
  )
}
