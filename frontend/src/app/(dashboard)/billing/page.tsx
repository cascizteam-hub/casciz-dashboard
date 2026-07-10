import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Billing' }
export default function BillingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Billing</h1>
        <p className="text-sm text-surface-500 mt-1">Manage your subscription and invoices.</p>
      </div>
      <div className="card p-8 text-center text-surface-500 text-sm">
        Billing will be built in Milestone 4.
      </div>
    </div>
  )
}
