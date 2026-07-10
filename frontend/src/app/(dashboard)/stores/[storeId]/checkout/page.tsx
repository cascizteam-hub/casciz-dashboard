'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CreditCard, ShoppingCart, Settings2 } from 'lucide-react'
import { useStoreCheckout } from '@/hooks/useCheckout'
import CheckoutStatusBadge from '@/components/checkout/CheckoutStatusBadge'
import CheckoutSummaryCard from '@/components/checkout/CheckoutSummaryCard'
import PaymentSettingsForm from '@/components/checkout/PaymentSettingsForm'
import EmptyState from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeletons'
import type { CheckoutStatus, PaymentProvider, PaymentSettingsFormValues } from '@/types'

interface Props { params: Promise<{ storeId: string }> }

const STATUS_FILTERS: Array<{ value: CheckoutStatus | ''; label: string }> = [
  { value: '',            label: 'All' },
  { value: 'OPEN',        label: 'Open' },
  { value: 'PROCESSING',  label: 'Processing' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'ABANDONED',   label: 'Abandoned' },
  { value: 'FAILED',      label: 'Failed' },
]

const PAYMENT_PROVIDERS: PaymentProvider[] = ['STRIPE', 'MANUAL']

type Tab = 'checkouts' | 'payments'

export default function CheckoutPage({ params }: Props) {
  const { storeId } = use(params)
  const {
    checkouts, totalElements, paymentSettings, isLoading, isSubmitting,
    fetchCheckouts, fetchPaymentSettings, savePaymentSettings,
  } = useStoreCheckout(storeId)

  const [tab,           setTab]           = useState<Tab>('checkouts')
  const [statusFilter,  setStatusFilter]  = useState<CheckoutStatus | ''>('')
  const [activeProvider, setActiveProvider] = useState<PaymentProvider | null>(null)
  const [saveSuccess,   setSaveSuccess]   = useState(false)

  useEffect(() => { fetchCheckouts({ status: statusFilter || undefined }) },
    [fetchCheckouts, statusFilter])

  useEffect(() => { fetchPaymentSettings() }, [fetchPaymentSettings])

  const handleSavePaymentSettings = async (values: PaymentSettingsFormValues) => {
    await savePaymentSettings({
      provider:      values.provider,
      enabled:       values.enabled,
      publicKey:     values.publicKey  || undefined,
      secretKey:     values.secretKey  || undefined,
      webhookSecret: values.webhookSecret || undefined,
      liveMode:      values.liveMode,
      displayName:   values.displayName || undefined,
    })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    setActiveProvider(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Store
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium">Checkout & Payments</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Checkout & Payments</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Monitor checkout sessions and configure payment gateways.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Payment settings saved successfully.
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-surface-200">
        {([
          { id: 'checkouts', label: 'Checkout sessions', icon: ShoppingCart },
          { id: 'payments',  label: 'Payment gateways',  icon: CreditCard },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'text-primary-600 border-primary-600'
                : 'text-surface-500 border-transparent hover:text-surface-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Checkouts tab ────────────────────────────────────────────────── */}
      {tab === 'checkouts' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATUS_FILTERS.filter((f) => f.value).map((f) => {
              const count = checkouts.filter((c) => c.status === f.value).length
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value as CheckoutStatus)}
                  className={`card p-4 text-left transition-all ${
                    statusFilter === f.value ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <CheckoutStatusBadge status={f.value as CheckoutStatus} />
                  <p className="text-2xl font-bold text-surface-900 mt-2">{count}</p>
                </button>
              )
            })}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value as CheckoutStatus | '')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : checkouts.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-7 w-7" />}
              title="No checkout sessions yet"
              description="Checkout sessions will appear here once customers start placing orders."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {checkouts.map((checkout) => (
                <CheckoutSummaryCard key={checkout.id} checkout={checkout} />
              ))}
            </div>
          )}

          {totalElements > checkouts.length && (
            <p className="text-center text-sm text-surface-500">
              Showing {checkouts.length} of {totalElements} sessions
            </p>
          )}
        </div>
      )}

      {/* ── Payment gateways tab ─────────────────────────────────────────── */}
      {tab === 'payments' && (
        <div className="space-y-4">
          {/* Provider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAYMENT_PROVIDERS.map((provider) => {
              const existing = paymentSettings.find((s) => s.provider === provider)
              const providerLabels: Record<PaymentProvider, string> = {
                STRIPE: 'Stripe', PAYPAL: 'PayPal', MANUAL: 'Manual / Cash',
              }
              return (
                <div key={provider} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-surface-900 text-sm">{providerLabels[provider]}</p>
                        {existing?.enabled && (
                          <span className="text-xs text-green-600 font-medium">● Enabled</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveProvider(activeProvider === provider ? null : provider)}
                      className="btn-secondary text-xs h-8 px-3 gap-1.5"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      {activeProvider === provider ? 'Cancel' : existing ? 'Edit' : 'Configure'}
                    </button>
                  </div>

                  {existing && (
                    <div className="text-xs text-surface-500 space-y-0.5">
                      {existing.publicKey && (
                        <p>Public key: <span className="font-mono">{existing.publicKey.slice(0, 12)}…</span></p>
                      )}
                      <p>Mode: <span className={existing.liveMode ? 'text-green-600' : 'text-yellow-600'}>
                        {existing.liveMode ? 'Live' : 'Test / Sandbox'}
                      </span></p>
                    </div>
                  )}

                  {activeProvider === provider && (
                    <div className="mt-4 border-t border-surface-100 pt-4">
                      <PaymentSettingsForm
                        provider={provider}
                        existing={existing}
                        onSave={handleSavePaymentSettings}
                        isLoading={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="card p-5 bg-surface-50">
            <h3 className="text-sm font-semibold text-surface-900 mb-2">Webhook endpoint</h3>
            <p className="text-xs text-surface-600 mb-2">
              Configure this URL in your Stripe dashboard to receive payment events:
            </p>
            <code className="block bg-surface-0 border border-surface-200 rounded-lg px-3 py-2 text-xs font-mono text-surface-700 break-all">
              {typeof window !== 'undefined' ? window.location.origin : 'https://your-store.casciz.store'}
              /api/v1/webhooks/stripe/{storeId}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
