'use client'

import Link from 'next/link'
import { ExternalLink, MoreVertical, Globe, Pencil, Trash2, Archive, Rocket } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import StoreStatusBadge from './StoreStatusBadge'
import { cn } from '@/lib/utils'
import type { StoreSummary, StoreStatus } from '@/types'

interface Props {
  store:          StoreSummary
  onChangeStatus: (storeId: string, status: StoreStatus) => Promise<void>
  onDelete:       (storeId: string) => Promise<void>
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD:'$', EUR:'€', GBP:'£', CAD:'CA$', AUD:'A$',
  JPY:'¥', INR:'₹', BRL:'R$', MXN:'MX$', SGD:'S$',
  AED:'د.إ', SAR:'﷼',
}

export default function StoreCard({ store, onChangeStatus, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const symbol   = CURRENCY_SYMBOLS[store.currency] ?? store.currency
  const initials = store.name.slice(0, 2).toUpperCase()

  return (
    <article className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo / initials */}
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-surface-100"
            />
          ) : (
            <span className="flex h-10 w-10 rounded-lg bg-primary-50 text-primary-600 items-center justify-center text-sm font-bold flex-shrink-0 select-none">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-surface-900 truncate text-sm leading-snug">
              {store.name}
            </h3>
            <p className="text-xs text-surface-500 truncate mt-0.5">
              {store.slug}.casciz.store
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Store actions"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-xl bg-surface-0 shadow-lg border border-surface-200 py-1 animate-fade-in">
              <Link
                href={`/stores/${store.id}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit store
              </Link>

              {store.status === 'DRAFT' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(store.id, 'PUBLISHED') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Rocket className="h-3.5 w-3.5" /> Publish
                </button>
              )}

              {store.status === 'PUBLISHED' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(store.id, 'DRAFT') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> Un-publish
                </button>
              )}

              {store.status !== 'ARCHIVED' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(store.id, 'ARCHIVED') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              )}

              {store.status !== 'PUBLISHED' && (
                <>
                  <div className="my-1 h-px bg-surface-100" />
                  <button
                    onClick={async () => { setMenuOpen(false); await onDelete(store.id) }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <StoreStatusBadge status={store.status} />
        <span className="text-xs text-surface-500">{symbol} {store.currency}</span>
      </div>

      {/* Footer link */}
      <Link
        href={`/stores/${store.id}`}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium',
          'border-surface-200 text-surface-600 hover:border-primary-200 hover:text-primary-600',
          'hover:bg-primary-50 transition-colors',
        )}
      >
        <ExternalLink className="h-3.5 w-3.5" /> Manage store
      </Link>
    </article>
  )
}
