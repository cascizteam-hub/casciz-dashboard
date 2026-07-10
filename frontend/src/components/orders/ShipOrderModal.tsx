'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Truck } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required').max(120),
  carrierName:    z.string().max(80).optional().or(z.literal('')),
  trackingUrl:    z.string().url('Must be a valid URL').max(512).optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onConfirm: (values: FormValues) => Promise<void>
  onClose:   () => void
}

export default function ShipOrderModal({ onConfirm, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await onConfirm(values)
      onClose()
    } catch (err) { setServerError(getErrorMessage(err)) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface-0 shadow-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 rounded-xl bg-accent-50 text-accent-600 items-center justify-center">
              <Truck className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-surface-900">Mark as shipped</h2>
          </div>
          <button onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="label">Tracking number <span className="text-red-500">*</span></label>
            <input {...register('trackingNumber')} type="text" placeholder="e.g. 1Z999AA10123456784"
              className={`input ${errors.trackingNumber ? 'input-error' : ''}`} />
            {errors.trackingNumber && <p className="error-text">{errors.trackingNumber.message}</p>}
          </div>
          <div>
            <label className="label">Carrier</label>
            <input {...register('carrierName')} type="text" placeholder="e.g. UPS, FedEx, USPS"
              className="input" />
          </div>
          <div>
            <label className="label">Tracking URL</label>
            <input {...register('trackingUrl')} type="url" placeholder="https://track.carrier.com/..."
              className={`input ${errors.trackingUrl ? 'input-error' : ''}`} />
            {errors.trackingUrl && <p className="error-text">{errors.trackingUrl.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><Truck className="h-4 w-4" /> Confirm shipment</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
