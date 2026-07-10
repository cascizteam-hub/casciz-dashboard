import type { CheckoutResponse } from '@/types'
import CheckoutStatusBadge from './CheckoutStatusBadge'

interface Props {
  checkout: CheckoutResponse
  currency?: string
}

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export default function CheckoutSummaryCard({ checkout }: Props) {
  const c = checkout.currency ?? 'USD'

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-surface-500 font-mono">{checkout.id.slice(0, 8)}…</p>
          <p className="text-sm font-semibold text-surface-900 mt-0.5">
            {checkout.customerFirstName
              ? `${checkout.customerFirstName} ${checkout.customerLastName}`
              : 'Guest'}
          </p>
          {checkout.customerEmail && (
            <p className="text-xs text-surface-500">{checkout.customerEmail}</p>
          )}
        </div>
        <CheckoutStatusBadge status={checkout.status} />
      </div>

      {/* Items preview */}
      {checkout.items.length > 0 && (
        <div className="space-y-2">
          {checkout.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt=""
                  className="h-8 w-8 rounded object-cover border border-surface-100 flex-shrink-0" />
              ) : (
                <span className="h-8 w-8 rounded bg-surface-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-surface-900 truncate">{item.productName}</p>
                <p className="text-xs text-surface-500">{item.variantTitle} × {item.quantity}</p>
              </div>
              <span className="text-xs font-medium text-surface-700">
                {fmt(item.lineTotal, c)}
              </span>
            </div>
          ))}
          {checkout.items.length > 3 && (
            <p className="text-xs text-surface-400">+ {checkout.items.length - 3} more item(s)</p>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-surface-100 pt-3 space-y-1">
        {checkout.discountAmount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-surface-500">Discount</span>
            <span className="text-green-600">−{fmt(checkout.discountAmount, c)}</span>
          </div>
        )}
        {checkout.shippingAmount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-surface-500">Shipping</span>
            <span className="text-surface-700">{fmt(checkout.shippingAmount, c)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-surface-900">Total</span>
          <span className="text-sm font-bold text-surface-900">{fmt(checkout.totalAmount, c)}</span>
        </div>
      </div>

      {/* Provider */}
      {checkout.paymentProvider && (
        <p className="text-xs text-surface-400">
          Payment: {checkout.paymentProvider}
        </p>
      )}
    </div>
  )
}
