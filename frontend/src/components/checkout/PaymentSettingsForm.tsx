'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import {
  paymentSettingsSchema,
  type PaymentSettingsFormValues,
} from '@/lib/validators/checkout.schemas'
import type { PaymentProvider, PaymentSettingsResponse } from '@/types'

interface Props {
  provider:    PaymentProvider
  existing?:   PaymentSettingsResponse
  onSave:      (values: PaymentSettingsFormValues) => Promise<void>
  isLoading:   boolean
}

const PROVIDER_INFO: Record<PaymentProvider, { name: string; description: string; docsUrl: string }> = {
  STRIPE: {
    name:        'Stripe',
    description: 'Accept credit cards, debit cards, Apple Pay, and Google Pay.',
    docsUrl:     'https://dashboard.stripe.com/apikeys',
  },
  PAYPAL: {
    name:        'PayPal',
    description: 'Accept PayPal wallet and card payments. (Coming soon)',
    docsUrl:     'https://developer.paypal.com',
  },
  MANUAL: {
    name:        'Manual / Cash',
    description: 'Accept bank transfers, cash on delivery, or other manual methods.',
    docsUrl:     '',
  },
}

export default function PaymentSettingsForm({ provider, existing, onSave, isLoading }: Props) {
  const [showSecret,  setShowSecret]  = useState(false)
  const [showWebhook, setShowWebhook] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const info = PROVIDER_INFO[provider]

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      provider,
      enabled:     existing?.enabled ?? false,
      publicKey:   existing?.publicKey ?? '',
      secretKey:   '',      // never pre-filled for security
      webhookSecret: '',
      liveMode:    existing?.liveMode ?? false,
      displayName: existing?.displayName ?? '',
    },
  })

  const onSubmit = async (values: PaymentSettingsFormValues) => {
    setServerError(null)
    try {
      await onSave(values)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Provider header */}
      <div className="flex items-start gap-4 p-4 bg-surface-50 rounded-xl">
        <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-surface-900 text-sm">{info.name}</h3>
          <p className="text-xs text-surface-600 mt-0.5">{info.description}</p>
          {info.docsUrl && (
            <a href={info.docsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline mt-1 inline-block">
              Get API keys →
            </a>
          )}
        </div>
      </div>

      <input type="hidden" {...register('provider')} />

      {/* Enable toggle */}
      <label className="flex items-center justify-between p-4 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
        <div>
          <p className="font-medium text-surface-900 text-sm">Enable {info.name}</p>
          <p className="text-xs text-surface-500 mt-0.5">Allow customers to pay with {info.name}</p>
        </div>
        <input {...register('enabled')} type="checkbox" className="accent-primary-600 h-5 w-5" />
      </label>

      {/* Stripe / PayPal specific fields */}
      {provider !== 'MANUAL' && (
        <>
          <div>
            <label className="label">
              Publishable key
              <span className="ml-1 text-xs font-normal text-surface-400">(safe to expose in browser)</span>
            </label>
            <input {...register('publicKey')} type="text"
              placeholder={provider === 'STRIPE' ? 'pk_live_...' : 'client_id...'}
              className="input font-mono text-sm" />
          </div>

          <div>
            <label className="label">
              Secret key
              <span className="ml-1 text-xs font-normal text-surface-400">(encrypted at rest, never returned)</span>
            </label>
            <div className="relative">
              <input {...register('secretKey')}
                type={showSecret ? 'text' : 'password'}
                placeholder={existing ? '••••••••••••••••' : provider === 'STRIPE' ? 'sk_live_...' : 'secret...'}
                className="input font-mono text-sm pr-10"
              />
              <button type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.secretKey && <p className="error-text">{errors.secretKey.message}</p>}
          </div>

          {provider === 'STRIPE' && (
            <div>
              <label className="label">
                Webhook signing secret
                <span className="ml-1 text-xs font-normal text-surface-400">(whsec_...)</span>
              </label>
              <div className="relative">
                <input {...register('webhookSecret')}
                  type={showWebhook ? 'text' : 'password'}
                  placeholder={existing ? '••••••••••••••••' : 'whsec_...'}
                  className="input font-mono text-sm pr-10"
                />
                <button type="button"
                  onClick={() => setShowWebhook((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Live mode */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input {...register('liveMode')} type="checkbox" className="accent-primary-600 h-4 w-4" />
            <span className="text-sm text-surface-700">
              Live mode
              <span className="ml-1 text-xs text-surface-400">(uncheck to use test/sandbox keys)</span>
            </span>
          </label>
        </>
      )}

      {/* Display name */}
      <div>
        <label className="label">
          Display name
          <span className="ml-1 text-xs font-normal text-surface-400">(shown to customers at checkout)</span>
        </label>
        <input {...register('displayName')} type="text"
          placeholder={`Pay with ${info.name}`}
          className="input" />
      </div>

      <div className="flex justify-end pt-2 border-t border-surface-100">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
