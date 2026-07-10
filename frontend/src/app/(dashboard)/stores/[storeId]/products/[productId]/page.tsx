'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronLeft, Rocket, Archive, Package, Trash2, Loader2,
  TrendingUp, TrendingDown, Save,
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductStatusBadge from '@/components/products/ProductStatusBadge'
import InventoryAdjustModal from '@/components/products/InventoryAdjustModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { StoreDetailSkeleton } from '@/components/shared/Skeletons'
import { updateProductSchema, type UpdateProductFormValues } from '@/lib/validators/product.schemas'
import { getErrorMessage } from '@/lib/utils'
import type { VariantResponse } from '@/types'

interface Props { params: Promise<{ storeId: string; productId: string }> }

export default function ProductDetailPage({ params }: Props) {
  const { storeId, productId } = use(params)
  const {
    selectedProduct: product, categories, isLoading, isSubmitting,
    fetchProduct, fetchCategories, editProduct, changeStatus, deleteProduct, adjustStock,
  } = useProducts(storeId)

  const [serverError,       setServerError]       = useState<string | null>(null)
  const [saveSuccess,       setSaveSuccess]        = useState(false)
  const [adjustingVariant,  setAdjustingVariant]  = useState<VariantResponse | null>(null)
  const [confirmAction,     setConfirmAction]      = useState<'delete' | 'status' | null>(null)
  const [targetStatus,      setTargetStatus]       = useState<string | null>(null)

  useEffect(() => { fetchProduct(productId) }, [productId, fetchProduct])
  useEffect(() => { fetchCategories() },        [fetchCategories])

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  })

  useEffect(() => {
    if (product) {
      reset({
        name:             product.name,
        description:      product.description      ?? '',
        shortDescription: product.shortDescription ?? '',
        categoryId:       product.categoryId       ?? '',
        tags:             product.tags             ?? '',
        metaTitle:        product.metaTitle        ?? '',
        metaDescription:  product.metaDescription  ?? '',
        digital:          product.digital,
      })
    }
  }, [product, reset])

  const onSubmit = async (values: UpdateProductFormValues) => {
    if (!product) return
    setServerError(null)
    setSaveSuccess(false)
    try {
      await editProduct(product.id, {
        name:             values.name,
        description:      values.description      || undefined,
        shortDescription: values.shortDescription || undefined,
        categoryId:       values.categoryId       || undefined,
        tags:             values.tags             || undefined,
        metaTitle:        values.metaTitle        || undefined,
        metaDescription:  values.metaDescription  || undefined,
        digital:          values.digital,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) { setServerError(getErrorMessage(err)) }
  }

  const handleStatusAction = async () => {
    if (!product || !targetStatus) return
    await changeStatus(product.id, targetStatus as never)
    setConfirmAction(null)
    setTargetStatus(null)
  }

  const handleDeleteConfirm = async () => {
    if (!product) return
    await deleteProduct(product.id)
  }

  if (isLoading && !product) {
    return <div className="max-w-3xl mx-auto"><StoreDetailSkeleton /></div>
  }
  if (!product) {
    return (
      <div className="max-w-3xl mx-auto card p-8 text-center">
        <p className="text-surface-500 text-sm mb-4">Product not found.</p>
        <Link href={`/stores/${storeId}/products`} className="btn-secondary">Back to products</Link>
      </div>
    )
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}/products`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Products
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Header card */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-surface-100 flex-shrink-0" />
          ) : (
            <span className="flex h-12 w-12 rounded-xl bg-surface-100 text-surface-400 items-center justify-center text-lg font-bold flex-shrink-0">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-surface-900 truncate">{product.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <ProductStatusBadge status={product.status} />
              <span className="text-xs text-surface-400">
                {formatPrice(product.minPrice)} · {product.totalInventory} in stock
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {product.status === 'DRAFT' && (
            <button onClick={() => { setTargetStatus('ACTIVE'); setConfirmAction('status') }}
              className="btn-primary text-xs h-8 px-3 gap-1.5" disabled={isSubmitting}>
              <Rocket className="h-3.5 w-3.5" /> Activate
            </button>
          )}
          {product.status === 'ACTIVE' && (
            <button onClick={() => { setTargetStatus('DRAFT'); setConfirmAction('status') }}
              className="btn-secondary text-xs h-8 px-3 gap-1.5" disabled={isSubmitting}>
              <Package className="h-3.5 w-3.5" /> Deactivate
            </button>
          )}
          {product.status !== 'ARCHIVED' && (
            <button onClick={() => { setTargetStatus('ARCHIVED'); setConfirmAction('status') }}
              className="btn-secondary text-xs h-8 px-3 gap-1.5" disabled={isSubmitting}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
          )}
          {product.status !== 'ACTIVE' && (
            <button onClick={() => setConfirmAction('delete')}
              className="btn text-xs h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              disabled={isSubmitting}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900 pb-3 border-b border-surface-100">
            Product details
          </h2>

          {serverError && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
          )}
          {saveSuccess && (
            <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Changes saved.</div>
          )}

          <div>
            <label className="label">Name <span className="text-red-500">*</span></label>
            <input {...register('name')} type="text" className={`input ${errors.name ? 'input-error' : ''}`} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Short description</label>
            <input {...register('shortDescription')} type="text" className="input" />
          </div>

          <div>
            <label className="label">Full description</label>
            <textarea {...register('description')} rows={5} className="input resize-y" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select {...register('categoryId')} className="input">
                <option value="">— No category —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags</label>
              <input {...register('tags')} type="text" placeholder="summer, sale" className="input" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input {...register('digital')} type="checkbox" className="accent-primary-600 h-4 w-4" />
            <span className="text-sm text-surface-700">Digital product (no shipping)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-100">
            <div>
              <label className="label">Meta title</label>
              <input {...register('metaTitle')} type="text" className="input" />
            </div>
            <div>
              <label className="label">Meta description</label>
              <textarea {...register('metaDescription')} rows={2} className="input resize-none" />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-surface-100">
            <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save changes</>}
            </button>
          </div>
        </div>
      </form>

      {/* Variants & Inventory */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-surface-900 pb-3 border-b border-surface-100">
          Variants & inventory
        </h2>
        <div className="space-y-3">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-50 border border-surface-100">
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">{v.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-surface-600 font-semibold">{formatPrice(v.price)}</span>
                  {v.sku && <span className="text-xs text-surface-400">SKU: {v.sku}</span>}
                  <span className={`text-xs font-medium ${v.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {v.inventoryQuantity != null ? `${v.inventoryQuantity} in stock` : 'Unlimited'}
                  </span>
                </div>
              </div>
              {v.inventoryQuantity != null && (
                <button
                  onClick={() => setAdjustingVariant(v)}
                  className="btn-secondary text-xs h-8 px-3 gap-1.5 flex-shrink-0"
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Adjust
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      {product.images.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-surface-900 pb-3 border-b border-surface-100">Images</h2>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img, i) => (
              <div key={img.id} className="relative">
                <img src={img.url} alt={img.altText ?? ''} className="h-20 w-20 object-cover rounded-xl border border-surface-200" />
                {i === 0 && (
                  <span className="absolute -top-1 -left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory modal */}
      {adjustingVariant && (
        <InventoryAdjustModal
          variant={adjustingVariant}
          onConfirm={async (variantId, delta) => {
            await adjustStock(product.id, { variantId, delta })
          }}
          onClose={() => setAdjustingVariant(null)}
        />
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Delete product"
        description="This permanently deletes the product and all its variants. This cannot be undone."
        confirmLabel="Delete product"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'status'}
        title={targetStatus === 'ACTIVE' ? 'Activate product' : targetStatus === 'ARCHIVED' ? 'Archive product' : 'Deactivate product'}
        description={
          targetStatus === 'ACTIVE'   ? 'The product will be visible to customers on your storefront.' :
          targetStatus === 'ARCHIVED' ? 'The product will be hidden from your storefront. You can restore it later.' :
                                        'The product will be hidden from your storefront.'
        }
        confirmLabel={targetStatus === 'ACTIVE' ? 'Activate' : targetStatus === 'ARCHIVED' ? 'Archive' : 'Deactivate'}
        variant="warning"
        isLoading={isSubmitting}
        onConfirm={handleStatusAction}
        onCancel={() => { setConfirmAction(null); setTargetStatus(null) }}
      />
    </div>
  )
}
