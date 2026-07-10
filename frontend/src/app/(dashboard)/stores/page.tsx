'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Store as StoreIcon } from 'lucide-react'
import { useStores } from '@/hooks/useStores'
import StoreCard from '@/components/stores/StoreCard'
import { StoreCardSkeleton } from '@/components/shared/Skeletons'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { StoreStatus } from '@/types'

export default function StoresPage() {
  const {
    stores, totalElements, isLoading, isSubmitting,
    fetchStores, changeStatus, deleteStore,
  } = useStores()

  const [searchQuery, setSearchQuery]       = useState('')
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const load = useCallback(() => {
    fetchStores({ q: debouncedQuery || undefined, size: 24 })
  }, [fetchStores, debouncedQuery])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (storeId: string, status: StoreStatus) => {
    await changeStatus(storeId, status)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteStore(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Stores</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {totalElements > 0
              ? `${totalElements} store${totalElements !== 1 ? 's' : ''}`
              : 'Create and manage your online stores'}
          </p>
        </div>
        <Link href="/stores/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New store
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stores…"
          className="input pl-9"
          aria-label="Search stores"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <StoreCardSkeleton key={i} />)}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={<StoreIcon className="h-7 w-7" />}
          title={debouncedQuery ? 'No stores match your search' : 'No stores yet'}
          description={
            debouncedQuery
              ? 'Try a different search term.'
              : 'Create your first store and start selling in minutes.'
          }
          action={
            !debouncedQuery ? (
              <Link href="/stores/new" className="btn-primary">
                <Plus className="h-4 w-4" /> Create your first store
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onChangeStatus={handleStatusChange}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete store"
        description="This will permanently delete the store and all its data. This action cannot be undone."
        confirmLabel="Delete store"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
