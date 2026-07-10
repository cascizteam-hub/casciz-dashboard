'use client'

import Link from 'next/link'
import { MoreVertical, Pencil, Trash2, Archive, Rocket, Package } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ProductStatusBadge from './ProductStatusBadge'
import { cn } from '@/lib/utils'
import type { ProductSummary, ProductStatus } from '@/types'

interface Props {
  storeId:        string
  product:        ProductSummary
  onChangeStatus: (id: string, status: ProductStatus) => Promise<void>
  onDelete:       (id: string) => void
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export default function ProductCard({ storeId, product, onChangeStatus, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = product.name.slice(0, 2).toUpperCase()

  return (
    <article className="card overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-40 bg-surface-100">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-surface-300">{initials}</span>
          </div>
        )}
        {/* Out of stock badge */}
        {!product.inStock && (
          <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
            Out of stock
          </span>
        )}
        {/* Menu */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg bg-white/90 text-surface-600 hover:text-surface-900 shadow-sm"
            aria-label="Product actions"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-xl bg-surface-0 shadow-lg border border-surface-200 py-1 animate-fade-in">
              <Link
                href={`/stores/${storeId}/products/${product.id}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>

              {product.status === 'DRAFT' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(product.id, 'ACTIVE') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Rocket className="h-3.5 w-3.5" /> Activate
                </button>
              )}
              {product.status === 'ACTIVE' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(product.id, 'DRAFT') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Package className="h-3.5 w-3.5" /> Deactivate
                </button>
              )}
              {product.status !== 'ARCHIVED' && (
                <button
                  onClick={async () => { setMenuOpen(false); await onChangeStatus(product.id, 'ARCHIVED') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              )}
              {product.status !== 'ACTIVE' && (
                <>
                  <div className="my-1 h-px bg-surface-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(product.id) }}
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

      {/* Details */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-surface-900 text-sm leading-snug truncate">
            {product.name}
          </h3>
          {product.categoryName && (
            <p className="text-xs text-surface-500 mt-0.5">{product.categoryName}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-100">
          <span className="font-semibold text-surface-900 text-sm">
            {formatPrice(product.minPrice)}
          </span>
          <ProductStatusBadge status={product.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>{product.variantCount} variant{product.variantCount !== 1 ? 's' : ''}</span>
          <span className={cn(
            product.inStock ? 'text-green-600' : 'text-red-500',
            'font-medium',
          )}>
            {product.totalInventory > 0 ? `${product.totalInventory} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </article>
  )
}
