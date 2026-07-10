'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import {
  updateStoreSchema,
  type UpdateStoreFormValues,
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  COMMON_TIMEZONES,
} from '@/lib/validators/store.schemas'
import { useStores } from '@/hooks/useStores'
import { getErrorMessage } from '@/lib/utils'
import type { StoreResponse } from '@/types'

interface Props {
  store: StoreResponse
  onSaved?: (updated: StoreResponse) => void
}

export default function EditStoreForm({ store, onSaved }: Props) {
  const { updateStoreDetails, isSubmitting } = useStores()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateStoreFormValues>({
    resolver:      zodResolver(updateStoreSchema),
    defaultValues: {
      name:          store.name,
      description:   store.description   ?? '',
      logoUrl:       store.logoUrl       ?? '',
      faviconUrl:    store.faviconUrl    ?? '',
      customDomain:  store.customDomain  ?? '',
      currency:      store.currency,
      timezone:      store.timezone,
      contactEmail:  store.contactEmail  ?? '',
      contactPhone:  store.contactPhone  ?? '',
    },
  })

  // Sync when store prop changes (e.g. after refetch)
  useEffect(() => {
    reset({
      name:         store.name,
      description:  store.description   ?? '',
      logoUrl:      store.logoUrl       ?? '',
      faviconUrl:   store.faviconUrl    ?? '',
      customDomain: store.customDomain  ?? '',
      currency:     store.currency,
      timezone:     store.timezone,
      contactEmail: store.contactEmail  ?? '',
      contactPhone: store.contactPhone  ?? '',
    })
  }, [store, reset])

  const onSubmit = async (values: UpdateStoreFormValues) => {
    setServerError(null)
    setSaveSuccess(false)
    try {
      const updated = await updateStoreDetails(store.id, {
        name:         values.name,
        description:  values.description  || undefined,
        logoUrl:      values.logoUrl      || undefined,
        faviconUrl:   values.faviconUrl   || undefined,
        customDomain: values.customDomain || undefined,
        currency:     values.currency,
        timezone:     values.timezone,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
      })
      if (updated) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        onSaved?.(updated)
      }
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

      {saveSuccess && (
        <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Changes saved.
        </div>
      )}

      {/* Basic info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-1 border-b border-surface-100 w-full">
          Basic information
        </legend>

        <div>
          <label htmlFor="edit-name" className="label">Store name <span className="text-red-500">*</span></label>
          <input {...register('name')} id="edit-name" type="text"
            className={`input ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="edit-description" className="label">Description</label>
          <textarea {...register('description')} id="edit-description" rows={3}
            className={`input resize-none ${errors.description ? 'input-error' : ''}`} />
          {errors.description && <p className="error-text">{errors.description.message}</p>}
        </div>
      </fieldset>

      {/* Branding */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-1 border-b border-surface-100 w-full">
          Branding
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-logoUrl" className="label">Logo URL</label>
            <input {...register('logoUrl')} id="edit-logoUrl" type="url"
              placeholder="https://…"
              className={`input ${errors.logoUrl ? 'input-error' : ''}`} />
            {errors.logoUrl && <p className="error-text">{errors.logoUrl.message}</p>}
          </div>
          <div>
            <label htmlFor="edit-faviconUrl" className="label">Favicon URL</label>
            <input {...register('faviconUrl')} id="edit-faviconUrl" type="url"
              placeholder="https://…"
              className={`input ${errors.faviconUrl ? 'input-error' : ''}`} />
            {errors.faviconUrl && <p className="error-text">{errors.faviconUrl.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="edit-customDomain" className="label">Custom domain</label>
          <input {...register('customDomain')} id="edit-customDomain" type="text"
            placeholder="shop.yourdomain.com"
            className={`input ${errors.customDomain ? 'input-error' : ''}`} />
          {errors.customDomain
            ? <p className="error-text">{errors.customDomain.message}</p>
            : <p className="mt-1 text-xs text-surface-500">Point a CNAME to casciz.store then enter the domain here.</p>
          }
        </div>
      </fieldset>

      {/* Regional */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-1 border-b border-surface-100 w-full">
          Regional settings
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-currency" className="label">Currency <span className="text-red-500">*</span></label>
            <select {...register('currency')} id="edit-currency"
              className={`input ${errors.currency ? 'input-error' : ''}`}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
              ))}
            </select>
            {errors.currency && <p className="error-text">{errors.currency.message}</p>}
          </div>
          <div>
            <label htmlFor="edit-timezone" className="label">Timezone <span className="text-red-500">*</span></label>
            <select {...register('timezone')} id="edit-timezone"
              className={`input ${errors.timezone ? 'input-error' : ''}`}>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            {errors.timezone && <p className="error-text">{errors.timezone.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 pb-1 border-b border-surface-100 w-full">
          Contact information
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-contactEmail" className="label">Contact email</label>
            <input {...register('contactEmail')} id="edit-contactEmail" type="email"
              className={`input ${errors.contactEmail ? 'input-error' : ''}`} />
            {errors.contactEmail && <p className="error-text">{errors.contactEmail.message}</p>}
          </div>
          <div>
            <label htmlFor="edit-contactPhone" className="label">Contact phone</label>
            <input {...register('contactPhone')} id="edit-contactPhone" type="tel"
              className={`input ${errors.contactPhone ? 'input-error' : ''}`} />
            {errors.contactPhone && <p className="error-text">{errors.contactPhone.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Save */}
      <div className="flex justify-end pt-2 border-t border-surface-200">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="btn-primary"
        >
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="h-4 w-4" /> Save changes</>}
        </button>
      </div>
    </form>
  )
}
