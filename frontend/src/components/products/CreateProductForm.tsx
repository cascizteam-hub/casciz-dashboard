'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  createProductSchema,
  type CreateProductFormValues,
} from '@/lib/validators/product.schemas'
import { useProducts } from '@/hooks/useProducts'
import { getErrorMessage } from '@/lib/utils'

interface Props { storeId: string }

export default function CreateProductForm({ storeId }: Props) {
  const router = useRouter()
  const { createProduct, fetchCategories, categories, isSubmitting } = useProducts(storeId)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const {
    register, control, handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      digital: false,
      variants: [{ title: 'Default', price: 0, allowBackorder: false }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  const onSubmit = async (values: CreateProductFormValues) => {
    setServerError(null)
    try {
      const id = await createProduct({
        name:             values.name,
        slug:             values.slug   || undefined,
        description:      values.description || undefined,
        shortDescription: values.shortDescription || undefined,
        categoryId:       values.categoryId || undefined,
        tags:             values.tags || undefined,
        metaTitle:        values.metaTitle || undefined,
        metaDescription:  values.metaDescription || undefined,
        digital:          values.digital,
        variants: values.variants.map((v) => ({
          title:              v.title,
          sku:                v.sku || undefined,
          price:              v.price,
          compareAtPrice:     v.compareAtPrice ?? undefined,
          costPrice:          v.costPrice ?? undefined,
          inventoryQuantity:  v.inventoryQuantity ?? undefined,
          allowBackorder:     v.allowBackorder,
          weightGrams:        v.weightGrams ?? undefined,
        })),
      })
      if (id) router.push(`/stores/${storeId}/products/${id}`)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Basic info */}
      <fieldset className="card p-6 space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-3 border-b border-surface-100 w-full block">
          Basic information
        </legend>

        <div>
          <label className="label">Product name <span className="text-red-500">*</span></label>
          <input {...register('name')} type="text" placeholder="e.g. Classic Cotton T-Shirt"
            className={`input ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">URL slug <span className="ml-1 text-xs font-normal text-surface-400">(optional, auto-generated)</span></label>
          <input {...register('slug')} type="text" placeholder="classic-cotton-t-shirt"
            className={`input ${errors.slug ? 'input-error' : ''}`} />
          {errors.slug && <p className="error-text">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="label">Short description</label>
          <input {...register('shortDescription')} type="text" maxLength={500}
            placeholder="One-line summary shown in listings"
            className={`input ${errors.shortDescription ? 'input-error' : ''}`} />
        </div>

        <div>
          <label className="label">Full description</label>
          <textarea {...register('description')} rows={5}
            placeholder="Detailed product description…"
            className="input resize-y" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select {...register('categoryId')} className="input">
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tags <span className="text-xs font-normal text-surface-400">(comma-separated)</span></label>
            <input {...register('tags')} type="text" placeholder="summer, sale, featured"
              className="input" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input {...register('digital')} type="checkbox" className="accent-primary-600 h-4 w-4" />
          <span className="text-sm text-surface-700">This is a digital product (no shipping required)</span>
        </label>
      </fieldset>

      {/* Variants */}
      <fieldset className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <legend className="text-sm font-semibold text-surface-900">Variants & pricing</legend>
          <button type="button" onClick={() => append({ title: '', price: 0, allowBackorder: false })}
            className="btn-ghost text-xs h-8 px-3">
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border border-surface-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">
                Variant {index + 1}
              </h4>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Title <span className="text-red-500">*</span></label>
                <input {...register(`variants.${index}.title`)} type="text"
                  placeholder={fields.length === 1 ? 'Default' : 'e.g. Small / Blue'}
                  className={`input text-sm ${errors.variants?.[index]?.title ? 'input-error' : ''}`} />
              </div>
              <div>
                <label className="label">SKU</label>
                <input {...register(`variants.${index}.sku`)} type="text" placeholder="PROD-001-S-BLU"
                  className="input text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Price ($) <span className="text-red-500">*</span></label>
                <input {...register(`variants.${index}.price`, { valueAsNumber: true })}
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className={`input text-sm ${errors.variants?.[index]?.price ? 'input-error' : ''}`} />
                {errors.variants?.[index]?.price && (
                  <p className="error-text">{errors.variants[index]?.price?.message}</p>
                )}
              </div>
              <div>
                <label className="label">Compare-at ($)</label>
                <input {...register(`variants.${index}.compareAtPrice`, { valueAsNumber: true })}
                  type="number" step="0.01" min="0" placeholder="0.00" className="input text-sm" />
              </div>
              <div>
                <label className="label">Stock qty</label>
                <input {...register(`variants.${index}.inventoryQuantity`, { valueAsNumber: true })}
                  type="number" min="0" placeholder="∞ unlimited" className="input text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input {...register(`variants.${index}.allowBackorder`)} type="checkbox"
                className="accent-primary-600 h-4 w-4" />
              <span className="text-xs text-surface-700">Allow orders when out of stock</span>
            </label>
          </div>
        ))}
        {errors.variants?.root && (
          <p className="error-text">{errors.variants.root.message}</p>
        )}
      </fieldset>

      {/* SEO */}
      <fieldset className="card p-6 space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-3 border-b border-surface-100 w-full block">
          SEO
        </legend>
        <div>
          <label className="label">Meta title</label>
          <input {...register('metaTitle')} type="text" maxLength={150}
            placeholder="Defaults to product name" className="input" />
        </div>
        <div>
          <label className="label">Meta description</label>
          <textarea {...register('metaDescription')} rows={2} maxLength={300}
            className="input resize-none" />
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create product'}
        </button>
      </div>
    </form>
  )
}
