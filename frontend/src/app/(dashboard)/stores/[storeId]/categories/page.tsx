'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Skeleton } from '@/components/shared/Skeletons'
import { categorySchema, type CategoryFormValues } from '@/lib/validators/product.schemas'
import { getErrorMessage } from '@/lib/utils'
import type { CategoryResponse } from '@/types'

interface Props { params: Promise<{ storeId: string }> }

function CategoryForm({
  initial, onSave, onCancel, isLoading,
}: {
  initial?: CategoryResponse
  onSave:   (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name:        initial?.name        ?? '',
      slug:        initial?.slug        ?? '',
      description: initial?.description ?? '',
      imageUrl:    initial?.imageUrl    ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4 border border-primary-200 rounded-xl p-5 bg-primary-50">
      <h3 className="text-sm font-semibold text-surface-900">{initial ? 'Edit category' : 'New category'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Name <span className="text-red-500">*</span></label>
          <input {...register('name')} type="text" placeholder="e.g. Clothing"
            className={`input ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Slug <span className="text-xs font-normal text-surface-400">(optional)</span></label>
          <input {...register('slug')} type="text" placeholder="clothing"
            className={`input ${errors.slug ? 'input-error' : ''}`} />
          {errors.slug && <p className="error-text">{errors.slug.message}</p>}
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <input {...register('description')} type="text" placeholder="Brief description"
          className="input" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn-primary text-sm">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save category'}
        </button>
      </div>
    </form>
  )
}

export default function CategoriesPage({ params }: Props) {
  const { storeId } = use(params)
  const { categories, isLoading, isSubmitting, fetchCategories, createCategory, editCategory, deleteCategory } = useProducts(storeId)
  const [showForm,      setShowForm]      = useState(false)
  const [editTarget,    setEditTarget]    = useState<CategoryResponse | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null)
  const [serverError,   setServerError]   = useState<string | null>(null)

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleCreate = async (values: CategoryFormValues) => {
    setServerError(null)
    try {
      await createCategory({
        name:        values.name,
        slug:        values.slug        || undefined,
        description: values.description || undefined,
        imageUrl:    values.imageUrl    || undefined,
      })
      setShowForm(false)
    } catch (err) { setServerError(getErrorMessage(err)) }
  }

  const handleEdit = async (values: CategoryFormValues) => {
    if (!editTarget) return
    setServerError(null)
    try {
      await editCategory(editTarget.id, {
        name:        values.name,
        description: values.description || undefined,
        imageUrl:    values.imageUrl    || undefined,
      })
      setEditTarget(null)
    } catch (err) { setServerError(getErrorMessage(err)) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}/products`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Products
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium">Categories</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Categories</h1>
          <p className="text-sm text-surface-500 mt-0.5">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditTarget(null) }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      {/* Inline create form */}
      {showForm && !editTarget && (
        <CategoryForm onSave={handleCreate} onCancel={() => setShowForm(false)} isLoading={isSubmitting} />
      )}

      {/* List */}
      <div className="card divide-y divide-surface-100">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : categories.length === 0 && !showForm ? (
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title="No categories yet"
            description="Organise your products into categories to make browsing easier."
            action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add first category</button>}
          />
        ) : (
          categories.map((cat) => (
            <div key={cat.id}>
              {editTarget?.id === cat.id ? (
                <div className="p-4">
                  <CategoryForm initial={cat} onSave={handleEdit} onCancel={() => setEditTarget(null)} isLoading={isSubmitting} />
                </div>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <span className="flex h-10 w-10 rounded-lg bg-surface-100 text-surface-400 items-center justify-center flex-shrink-0">
                      <Tag className="h-5 w-5" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 text-sm">{cat.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">/{cat.slug} · {cat.productCount} products</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditTarget(cat)}
                      className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(cat.id)}
                      className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete category"
        description="Products in this category will be uncategorised but not deleted."
        confirmLabel="Delete category"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={async () => { if (deleteTarget) { await deleteCategory(deleteTarget); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
