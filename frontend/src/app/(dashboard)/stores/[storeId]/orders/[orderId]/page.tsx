'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Truck, CheckCircle2, XCircle,
  RefreshCcw, MessageSquare, Loader2, ExternalLink,
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatusBadge, FulfilmentBadge } from '@/components/orders/OrderStatusBadge'
import ShipOrderModal from '@/components/orders/ShipOrderModal'
import RefundOrderModal from '@/components/orders/RefundOrderModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { StoreDetailSkeleton } from '@/components/shared/Skeletons'
import { getErrorMessage } from '@/lib/utils'

interface Props { params: Promise<{ storeId: string; orderId: string }> }

export default function OrderDetailPage({ params }: Props) {
  const { storeId, orderId } = use(params)
  const { selectedOrder: order, isLoading, isSubmitting,
    fetchOrder, shipOrder, markDelivered, cancelOrder, refundOrder, addNote
  } = useOrders(storeId)

  const [showShipModal,    setShowShipModal]    = useState(false)
  const [showRefundModal,  setShowRefundModal]  = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showNoteForm,     setShowNoteForm]     = useState(false)
  const [noteBody,         setNoteBody]         = useState('')
  const [noteVisible,      setNoteVisible]      = useState(false)
  const [error,            setError]            = useState<string | null>(null)

  useEffect(() => { fetchOrder(orderId) }, [orderId, fetchOrder])

  const fmt = (n: number, cur = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n)

  const handleDeliver = async () => {
    try { await markDelivered(orderId) }
    catch (err) { setError(getErrorMessage(err)) }
  }

  const handleCancel = async () => {
    setShowCancelDialog(false)
    try { await cancelOrder(orderId, 'Cancelled by store owner') }
    catch (err) { setError(getErrorMessage(err)) }
  }

  const handleAddNote = async () => {
    if (!noteBody.trim()) return
    try {
      await addNote(orderId, { body: noteBody, visibleToCustomer: noteVisible })
      setNoteBody(''); setShowNoteForm(false)
    } catch (err) { setError(getErrorMessage(err)) }
  }

  if (isLoading && !order) {
    return <div className="max-w-4xl mx-auto"><StoreDetailSkeleton /></div>
  }
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto card p-8 text-center">
        <p className="text-surface-500 text-sm mb-4">Order not found.</p>
        <Link href={`/stores/${storeId}/orders`} className="btn-secondary">Back to orders</Link>
      </div>
    )
  }

  const canShip    = order.status === 'PAID' || order.status === 'PROCESSING'
  const canDeliver = order.status === 'SHIPPED'
  const canCancel  = !['CANCELLED','REFUNDED','DELIVERED'].includes(order.status)
  const canRefund  = ['PAID','PROCESSING','DELIVERED'].includes(order.status)
                     && order.refundableAmount > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}/orders`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Orders
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm font-mono font-semibold text-surface-900">{order.orderNumber}</span>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Order header */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-bold text-surface-900 font-mono">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} size="md" />
            <FulfilmentBadge status={order.fulfilmentStatus} />
          </div>
          <p className="text-sm text-surface-500 mt-1">
            {new Date(order.createdAt).toLocaleString()} · {order.totalItemCount} item{order.totalItemCount !== 1 ? 's' : ''}
            {order.paymentProvider && ` · ${order.paymentProvider}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {canShip && (
            <button onClick={() => setShowShipModal(true)} disabled={isSubmitting}
              className="btn-primary text-xs h-8 px-3 gap-1.5">
              <Truck className="h-3.5 w-3.5" /> Mark shipped
            </button>
          )}
          {canDeliver && (
            <button onClick={handleDeliver} disabled={isSubmitting}
              className="btn-primary text-xs h-8 px-3 gap-1.5">
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Mark delivered
            </button>
          )}
          {canRefund && (
            <button onClick={() => setShowRefundModal(true)} disabled={isSubmitting}
              className="btn-secondary text-xs h-8 px-3 gap-1.5">
              <RefreshCcw className="h-3.5 w-3.5" /> Refund
            </button>
          )}
          {canCancel && (
            <button onClick={() => setShowCancelDialog(true)} disabled={isSubmitting}
              className="btn text-xs h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: items + timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-surface-900 mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-surface-100 flex-shrink-0" />
                  ) : (
                    <span className="h-12 w-12 rounded-lg bg-surface-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-surface-500">{item.variantTitle}
                      {item.sku && <span className="ml-2 text-surface-400">SKU: {item.sku}</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-surface-900">{fmt(item.lineTotal, order.currency)}</p>
                    <p className="text-xs text-surface-500">{fmt(item.unitPrice, order.currency)} × {item.quantity}</p>
                    {item.refundedQuantity > 0 && (
                      <p className="text-xs text-red-500">{item.refundedQuantity} refunded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-surface-100 mt-4 pt-4 space-y-2">
              {[
                { label: 'Subtotal',  value: order.subtotal },
                { label: 'Shipping',  value: order.shippingAmount },
                { label: 'Tax',       value: order.taxAmount },
                ...(order.discountAmount > 0
                  ? [{ label: 'Discount', value: -order.discountAmount }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-surface-600">{label}</span>
                  <span className={value < 0 ? 'text-green-600' : 'text-surface-900'}>
                    {value < 0 ? '−' : ''}{fmt(Math.abs(value), order.currency)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base border-t border-surface-100 pt-2">
                <span>Total</span>
                <span>{fmt(order.totalAmount, order.currency)}</span>
              </div>
              {order.refundedAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Refunded</span>
                  <span>−{fmt(order.refundedAmount, order.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping info */}
          {order.trackingNumber && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-surface-900 mb-3">Shipping</h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-mono text-surface-900">{order.trackingNumber}</p>
                  {order.carrierName && <p className="text-xs text-surface-500 mt-0.5">{order.carrierName}</p>}
                  {order.shippedAt && (
                    <p className="text-xs text-surface-500 mt-0.5">
                      Shipped {new Date(order.shippedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-xs h-8 px-3 gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> Track
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order timeline */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-surface-900">Timeline</h2>
              <button onClick={() => setShowNoteForm((v) => !v)}
                className="btn-ghost text-xs h-8 px-3 gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Add note
              </button>
            </div>

            {showNoteForm && (
              <div className="mb-4 space-y-3 p-4 bg-surface-50 rounded-xl">
                <textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)}
                  rows={3} placeholder="Add a note…"
                  className="input resize-none text-sm" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-surface-600">
                    <input type="checkbox" checked={noteVisible}
                      onChange={(e) => setNoteVisible(e.target.checked)}
                      className="accent-primary-600" />
                    Visible to customer
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNoteForm(false)} className="btn-ghost text-xs h-8 px-3">Cancel</button>
                    <button onClick={handleAddNote} disabled={!noteBody.trim() || isSubmitting}
                      className="btn-primary text-xs h-8 px-3">
                      {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add note'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {[...order.notes].reverse().map((note) => (
                <div key={note.id} className="flex gap-3">
                  <span className={`flex h-7 w-7 flex-shrink-0 rounded-full items-center justify-center text-xs font-bold ${
                    note.system ? 'bg-surface-100 text-surface-400' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {note.system ? '⚙' : (note.author?.charAt(0).toUpperCase() ?? '?')}
                  </span>
                  <div>
                    <p className="text-sm text-surface-900">{note.body}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {note.author && !note.system && <>{note.author} · </>}
                      {new Date(note.createdAt).toLocaleString()}
                      {note.visibleToCustomer && (
                        <span className="ml-2 text-primary-500">visible to customer</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: customer + addresses */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-surface-900 mb-3">Customer</h2>
            <p className="font-medium text-surface-900 text-sm">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="text-xs text-surface-600 mt-0.5">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-xs text-surface-500">{order.customerPhone}</p>}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-surface-900 mb-3">Ship to</h2>
              <address className="not-italic text-sm text-surface-700 space-y-0.5">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.countryCode}</p>
              </address>
            </div>
          )}

          {/* Payment */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-surface-900 mb-3">Payment</h2>
            <p className="text-xs text-surface-600">Provider: {order.paymentProvider ?? 'Unknown'}</p>
            {order.paymentReference && (
              <p className="text-xs text-surface-400 font-mono mt-0.5 break-all">
                {order.paymentReference}
              </p>
            )}
          </div>

          {/* Notes from customer */}
          {order.customerNotes && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-surface-900 mb-2">Customer notes</h2>
              <p className="text-sm text-surface-700 italic">"{order.customerNotes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showShipModal && (
        <ShipOrderModal
          onConfirm={async (values) => {
            await shipOrder(orderId, { trackingNumber: values.trackingNumber,
              carrierName: values.carrierName || undefined,
              trackingUrl: values.trackingUrl || undefined })
          }}
          onClose={() => setShowShipModal(false)}
        />
      )}
      {showRefundModal && (
        <RefundOrderModal
          maxAmount={order.refundableAmount}
          currency={order.currency}
          onConfirm={async (amount, reason) => {
            await refundOrder(orderId, { amount, reason })
          }}
          onClose={() => setShowRefundModal(false)}
        />
      )}
      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel order"
        description="This will cancel the order and restore inventory. This cannot be undone."
        confirmLabel="Cancel order"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  )
}
