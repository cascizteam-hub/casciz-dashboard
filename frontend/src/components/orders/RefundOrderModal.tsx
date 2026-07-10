'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  amount: z.number({ invalid_type_error: 'Amount must be a number' })
           .positive('Amount must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(255),
})
type FormValues = z.infer<typeof schema>

interface Props {
  maxAmount: number
  currency:  string
  onConfirm: (amount: number, reason: string) => Promise<void>
  onClose:   () => void
}

export default function RefundOrderModal({ maxAmount, currency, onConfirm, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: maxAmount },
  })

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await onConfirm(values.amount, values.reason)
      onClose()
    } catch (err) { setServerError(getErrorMessage(err)) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface-0 shadow-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-surface-900">Issue refund</h2>
          <button onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-surface-600 mb-4">
          Maximum refundable: <strong>{fmt(maxAmount)}</strong>
        </p>

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="label">Refund amount ({currency}) <span className="text-red-500">*</span></label>
            <input {...register('amount', { valueAsNumber: true })}
              type="number" step="0.01" min="0.01" max={maxAmount}
              className={`input ${errors.amount ? 'input-error' : ''}`} />
            {errors.amount && <p className="error-text">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="label">Reason <span className="text-red-500">*</span></label>
            <input {...register('reason')} type="text"
              placeholder="e.g. Customer request, damaged item"
              className={`input ${errors.reason ? 'input-error' : ''}`} />
            {errors.reason && <p className="error-text">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="btn inline-flex items-center gap-2 px-4 py-2.5 text-sm h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                : 'Issue refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
