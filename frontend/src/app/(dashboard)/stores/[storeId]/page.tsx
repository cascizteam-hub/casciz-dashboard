'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Rocket, Archive, Globe, Trash2, Loader2 } from 'lucide-react'
import { useStores } from '@/hooks/useStores'
import EditStoreForm from '@/components/stores/EditStoreForm'
import StoreStatusBadge from '@/components/stores/StoreStatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { StoreDetailSkeleton } from '@/components/shared/Skeletons'
import type { StoreStatus } from '@/types'

interface Props {
  params: Promise<{ storeId: string }>
}

export default function StoreDetailPage({ params }: Props) {
  const { storeId }     = use(params)
  const {
    selectedStore, isLoading, isSubmitting,
    fetchStore, changeStatus, deleteStore,
  } = useStores()

  const [confirmAction, setConfirmAction] = useState<
    { type: 'delete' | 'status'; status?: StoreStatus } | null
  >(null)

  useEffect(() => {
    fetchStore(storeId)
  }, [storeId, fetchStore])

  const handleAction = async () => {
    if (!confirmAction || !selectedStore) return
    if (confirmAction.type === 'delete') {
      await deleteStore(selectedStore.id)
    } else if (confirmAction.type === 'status' && confirmAction.status) {
      await changeStatus(selectedStore.id, confirmAction.status)
    }
    setConfirmAction(null)
  }

  if (isLoading && !selectedStore) {
    return (
      <div className="max-w-2xl mx-auto">
        <StoreDetailSkeleton />
      </div>
    )
  }

  if (!selectedStore) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-surface-500 text-sm">Store not found or you don&apos;t have access.</p>
          <Link href="/stores" className="btn-secondary mt-4 inline-flex">
            Back to stores
          </Link>
        </div>
      </div>
    )
  }

  const statusActions: Array<{
    label: string
    icon: React.ReactNode
    status: StoreStatus
    variant: 'primary' | 'secondary' | 'danger'
  }> = []

  if (selectedStore.status === 'DRAFT') {
    statusActions.push({
      label: 'Publish store',
      icon: <Rocket className="h-4 w-4" />,
      status: 'PUBLISHED',
      variant: 'primary',
    })
  }
  if (selectedStore.status === 'PUBLISHED') {
    statusActions.push({
      label: 'Un-publish',
      icon: <Globe className="h-4 w-4" />,
      status: 'DRAFT',
      variant: 'secondary',
    })
  }
  if (selectedStore.status !== 'ARCHIVED') {
    statusActions.push({
      label: 'Archive store',
      icon: <Archive className="h-4 w-4" />,
      status: 'ARCHIVED',
      variant: 'secondary',
    })
  }

  const confirmConfig = confirmAction
    ? confirmAction.type === 'delete'
      ? {
          title: 'Delete store',
          description: 'This will permanently delete the store and all its data. This cannot be undone.',
          confirmLabel: 'Delete store',
          variant: 'danger' as const,
        }
      : confirmAction.status === 'PUBLISHED'
      ? {
          title: 'Publish store',
          description: 'Your store will become publicly visible to customers.',
          confirmLabel: 'Publish',
          variant: 'warning' as const,
        }
      : confirmAction.status === 'ARCHIVED'
      ? {
          title: 'Archive store',
          description: 'Your store will be deactivated. You can restore it at any time.',
          confirmLabel: 'Archive',
          variant: 'warning' as const,
        }
      : {
          title: 'Un-publish store',
          description: 'Your store will be taken offline. Existing customers will not be able to access it.',
          confirmLabel: 'Un-publish',
          variant: 'warning' as const,
        }
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/stores"
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Stores
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium truncate max-w-xs">
          {selectedStore.name}
        </span>
      </div>

      {/* Store header */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {selectedStore.logoUrl ? (
            <img
              src={selectedStore.logoUrl}
              alt=""
              className="h-12 w-12 rounded-xl object-cover border border-surface-100 flex-shrink-0"
            />
          ) : (
            <span className="flex h-12 w-12 rounded-xl bg-primary-50 text-primary-600 items-center justify-center text-base font-bold flex-shrink-0 select-none">
              {selectedStore.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-surface-900 truncate">
              {selectedStore.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StoreStatusBadge status={selectedStore.status} />
              <span className="text-xs text-surface-400">{selectedStore.slug}.casciz.store</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {statusActions.map((action) => (
            <button
              key={action.status}
              onClick={() => setConfirmAction({ type: 'status', status: action.status })}
              disabled={isSubmitting}
              className={
                action.variant === 'primary' ? 'btn-primary text-xs h-8 px-3' : 'btn-secondary text-xs h-8 px-3'
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </button>
          ))}

          {selectedStore.status !== 'PUBLISHED' && (
            <button
              onClick={() => setConfirmAction({ type: 'delete' })}
              className="btn text-xs h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Quick links to builder tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/stores/${selectedStore.id}/pages`}
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <span className="flex h-10 w-10 rounded-xl bg-primary-50 text-primary-600 items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </span>
          <div>
            <p className="font-semibold text-surface-900 text-sm group-hover:text-primary-700 transition-colors">Manage pages</p>
            <p className="text-xs text-surface-500 mt-0.5">Create and organise store pages</p>
          </div>
        </Link>
        <Link
          href={`/stores/${selectedStore.id}/products`}
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <span className="flex h-10 w-10 rounded-xl bg-accent-50 text-accent-600 items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </span>
          <div>
            <p className="font-semibold text-surface-900 text-sm group-hover:text-accent-700 transition-colors">Products</p>
            <p className="text-xs text-surface-500 mt-0.5">Manage catalogue and inventory</p>
          </div>
        </Link>
      </div>

              <Link
          href={`/stores/${selectedStore.id}/orders`}
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <span className="flex h-10 w-10 rounded-xl bg-purple-50 text-purple-600 items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <div>
            <p className="font-semibold text-surface-900 text-sm group-hover:text-purple-700 transition-colors">Orders</p>
            <p className="text-xs text-surface-500 mt-0.5">View and fulfil customer orders</p>
          </div>
        </Link>

      {/* Checkout link */}
      <Link
        href={`/stores/${selectedStore.id}/orders`}
        className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
      >
        <span className="flex h-10 w-10 rounded-xl bg-purple-50 text-purple-600 items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </span>
        <div>
          <p className="font-semibold text-surface-900 text-sm group-hover:text-purple-700 transition-colors">Checkout & Payments</p>
          <p className="text-xs text-surface-500 mt-0.5">View and manage customer orders</p>
        </div>
      </Link>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-surface-900 mb-5">Store settings</h2>
        <EditStoreForm store={selectedStore} />
      </div>

      {/* Confirm dialog */}
      {confirmConfig && confirmAction && (
        <ConfirmDialog
          open
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          isLoading={isSubmitting}
          onConfirm={handleAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
