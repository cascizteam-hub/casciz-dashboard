'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X } from 'lucide-react'
import {
  createStoreSchema,
  type CreateStoreFormValues,
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  COMMON_TIMEZONES,
} from '@/lib/validators/store.schemas'
import { useStores } from '@/hooks/useStores'
import { getErrorMessage } from '@/lib/utils'
import { SlugGenerator } from '@/lib/utils/slug'

export default function CreateStoreForm() {
  const router = useRouter()
  const { createStore, checkSlugAvailability, isSubmitting } = useStores()
  const [serverError, setServerError]       = useState<string | null>(null)
  const [slugStatus, setSlugStatus]         = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [slugDebounceTimer, setSlugDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStoreFormValues>({
    resolver:      zodResolver(createStoreSchema),
    defaultValues: { currency: 'USD', timezone: 'UTC' },
  })

  const watchedName = watch('name')
  const watchedSlug = watch('slug')

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !watchedSlug) {
      setValue('slug', SlugGenerator.toSlug(watchedName), { shouldValidate: false })
    }
  }, [watchedName, setValue, watchedSlug])

  // Debounced slug availability check
  useEffect(() => {
    if (!watchedSlug || watchedSlug.length < 3) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    if (slugDebounceTimer) clearTimeout(slugDebounceTimer)
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailability(watchedSlug)
      setSlugStatus(available ? 'available' : 'taken')
    }, 500)
    setSlugDebounceTimer(timer)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSlug, checkSlugAvailability])

  const onSubmit = async (values: CreateStoreFormValues) => {
    if (slugStatus === 'taken') return
    setServerError(null)
    try {
      const storeId = await createStore({
        name:         values.name,
        slug:         values.slug || undefined,
        description:  values.description || undefined,
        currency:     values.currency,
        timezone:     values.timezone,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
      })
      if (storeId) router.push(`/stores/${storeId}`)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Store name */}
      <div>
        <label htmlFor="name" className="label">Store name <span className="text-red-500">*</span></label>
        <input
          {...register('name')}
          id="name"
          type="text"
          placeholder="My Awesome Store"
          className={`input ${errors.name ? 'input-error' : ''}`}
        />
        {errors.name && <p className="error-text">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="label">
          Store URL
          <span className="ml-1.5 text-xs font-normal text-surface-500">
            (your-store.casciz.store)
          </span>
        </label>
        <div className="relative">
          <input
            {...register('slug')}
            id="slug"
            type="text"
            placeholder="my-awesome-store"
            className={`input pr-8 ${errors.slug || slugStatus === 'taken' ? 'input-error' : ''}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {slugStatus === 'checking'  && <Loader2 className="h-4 w-4 animate-spin text-surface-400" />}
            {slugStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
            {slugStatus === 'taken'     && <X className="h-4 w-4 text-red-500" />}
          </span>
        </div>
        {errors.slug       && <p className="error-text">{errors.slug.message}</p>}
        {slugStatus === 'taken' && !errors.slug && (
          <p className="error-text">This URL is already taken. Please choose another.</p>
        )}
        {slugStatus === 'available' && (
          <p className="mt-1 text-xs text-green-600">This URL is available.</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Tell customers what makes your store special…"
          className={`input resize-none ${errors.description ? 'input-error' : ''}`}
        />
        {errors.description && <p className="error-text">{errors.description.message}</p>}
      </div>

      {/* Currency + Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="currency" className="label">Currency <span className="text-red-500">*</span></label>
          <select
            {...register('currency')}
            id="currency"
            className={`input ${errors.currency ? 'input-error' : ''}`}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
            ))}
          </select>
          {errors.currency && <p className="error-text">{errors.currency.message}</p>}
        </div>

        <div>
          <label htmlFor="timezone" className="label">Timezone <span className="text-red-500">*</span></label>
          <select
            {...register('timezone')}
            id="timezone"
            className={`input ${errors.timezone ? 'input-error' : ''}`}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          {errors.timezone && <p className="error-text">{errors.timezone.message}</p>}
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactEmail" className="label">Contact email</label>
          <input
            {...register('contactEmail')}
            id="contactEmail"
            type="email"
            placeholder="store@example.com"
            className={`input ${errors.contactEmail ? 'input-error' : ''}`}
          />
          {errors.contactEmail && <p className="error-text">{errors.contactEmail.message}</p>}
        </div>

        <div>
          <label htmlFor="contactPhone" className="label">Contact phone</label>
          <input
            {...register('contactPhone')}
            id="contactPhone"
            type="tel"
            placeholder="+1 555 000 0000"
            className={`input ${errors.contactPhone ? 'input-error' : ''}`}
          />
          {errors.contactPhone && <p className="error-text">{errors.contactPhone.message}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || slugStatus === 'taken'}
          className="btn-primary"
        >
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
            : 'Create store'}
        </button>
      </div>
    </form>
  )
}
