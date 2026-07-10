'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Package } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/products/ProductCard'
import { ProductCardSkeleton } from '@/components/shared/Skeletons'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { ProductStatus } from '@/types'

interface Props { params: Promise<{ storeId: string }> }

const STATUS_FILTERS = [
  { value: '',         label: 'All' },
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'DRAFT',    label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function ProductsPage({ params }: Props) {
  const { storeId } = use(params)
  const {
    products, totalElements, categories, isLoading, isSubmitting,
    fetchProducts, fetchCategories, changeStatus, deleteProduct,
  } = useProducts(storeId)

  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    fetchProducts({
      q:          debouncedSearch || undefined,
      status:     statusFilter    || undefined,
      categoryId: categoryFilter  || undefined,
      size: 24,
    })
  }, [fetchProducts, debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => { load() },          [load])
  useEffect(() => { fetchCategories() }, [fetchCategories])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Products</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {totalElements > 0 ? `${totalElements} product${totalElements !== 1 ? 's' : ''}` : 'Manage your product catalogue'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/stores/${storeId}/categories`} className="btn-secondary text-sm">
            Categories
          </Link>
          <Link href={`/stores/${storeId}/products/new`} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
          <input
            type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-9 w-56"
          />
        </div>

        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-36 text-sm"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-44 text-sm"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title={debouncedSearch || statusFilter || categoryFilter ? 'No products match your filters' : 'No products yet'}
          description={debouncedSearch || statusFilter || categoryFilter
            ? 'Try adjusting your filters.'
            : 'Add your first product to start selling.'}
          action={!debouncedSearch && !statusFilter && !categoryFilter ? (
            <Link href={`/stores/${storeId}/products/new`} className="btn-primary">
              <Plus className="h-4 w-4" /> Add first product
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              storeId={storeId}
              product={product}
              onChangeStatus={async (id, status) => { await changeStatus(id, status) }}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete product"
        description="This permanently deletes the product and all its variants. This cannot be undone."
        confirmLabel="Delete product"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={async () => { if (deleteTarget) { await deleteProduct(deleteTarget); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
