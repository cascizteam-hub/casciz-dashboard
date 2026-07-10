'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { pageApi } from '@/lib/api/page.api'
import { getErrorMessage } from '@/lib/utils'
import type { PageSummary, PageType } from '@/types/builder'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  type:  z.enum(['HOME','ABOUT','CONTACT','CATALOG','CUSTOM'] as const),
  slug:  z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'Slug must be lowercase alphanumeric with hyphens')
    .max(80)
    .optional()
    .or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

interface Props {
  storeId:       string
  existingTypes: PageType[]
  onCreated:     (page: PageSummary) => void
  onClose:       () => void
}

const TYPE_OPTIONS: Array<{ value: PageType; label: string; description: string }> = [
  { value: 'HOME',    label: 'Home',    description: 'The main landing page (only one allowed)' },
  { value: 'ABOUT',   label: 'About',   description: 'Tell your story' },
  { value: 'CONTACT', label: 'Contact', description: 'Contact form and details' },
  { value: 'CATALOG', label: 'Catalog', description: 'Product listing page' },
  { value: 'CUSTOM',  label: 'Custom',  description: 'Any other page type' },
]

export default function CreatePageModal({ storeId, existingTypes, onCreated, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'CUSTOM' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const { data } = await pageApi.create(storeId, {
        title: values.title,
        type:  values.type,
        slug:  values.slug || undefined,
      })
      if (data.data) {
        onCreated({
          id:          data.data.id,
          title:       data.data.title,
          slug:        data.data.slug,
          type:        data.data.type,
          status:      data.data.status,
          sortOrder:   data.data.sortOrder,
          updatedAt:   data.data.updatedAt,
          publishedAt: data.data.publishedAt,
        })
      }
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const homeExists = existingTypes.includes('HOME')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface-0 shadow-lg p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-surface-900">New page</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-4">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="label">Page title <span className="text-red-500">*</span></label>
            <input {...register('title')} type="text" placeholder="About Us"
              className={`input ${errors.title ? 'input-error' : ''}`} />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Page type <span className="text-red-500">*</span></label>
            <select {...register('type')} className={`input ${errors.type ? 'input-error' : ''}`}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}
                  disabled={opt.value === 'HOME' && homeExists}>
                  {opt.label}{opt.value === 'HOME' && homeExists ? ' (already exists)' : ''}
                </option>
              ))}
            </select>
            {errors.type && <p className="error-text">{errors.type.message}</p>}
          </div>

          <div>
            <label className="label">
              Custom slug
              <span className="ml-1 text-xs font-normal text-surface-400">(optional)</span>
            </label>
            <input {...register('slug')} type="text" placeholder="about-us"
              className={`input ${errors.slug ? 'input-error' : ''}`} />
            {errors.slug
              ? <p className="error-text">{errors.slug.message}</p>
              : <p className="mt-1 text-xs text-surface-400">Leave blank to auto-generate from title.</p>
            }
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
