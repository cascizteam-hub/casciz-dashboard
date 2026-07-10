import { cn } from '@/lib/utils'
import type { FulfilmentStatus, OrderStatus } from '@/types'

const ORDER_CONFIG: Record<OrderStatus, { label: string; dot: string; badge: string }> = {
  PENDING_PAYMENT:   { label: 'Pending payment',  dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  PAID:              { label: 'Paid',              dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700' },
  PROCESSING:        { label: 'Processing',        dot: 'bg-primary-500',badge: 'bg-primary-50 text-primary-700' },
  SHIPPED:           { label: 'Shipped',           dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700' },
  DELIVERED:         { label: 'Delivered',         dot: 'bg-green-600',  badge: 'bg-green-100 text-green-800' },
  CANCELLED:         { label: 'Cancelled',         dot: 'bg-surface-300',badge: 'bg-surface-100 text-surface-500' },
  REFUNDED:          { label: 'Refunded',          dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600' },
  PARTIALLY_REFUNDED:{ label: 'Part. refunded',    dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
}

const FULFILMENT_CONFIG: Record<FulfilmentStatus, { label: string; badge: string }> = {
  UNFULFILLED:   { label: 'Unfulfilled',   badge: 'bg-surface-100 text-surface-600' },
  PARTIAL:       { label: 'Partial',       badge: 'bg-yellow-50 text-yellow-700' },
  READY_TO_SHIP: { label: 'Ready to ship', badge: 'bg-primary-50 text-primary-700' },
  SHIPPED:       { label: 'Shipped',       badge: 'bg-accent-50 text-accent-700' },
  DELIVERED:     { label: 'Delivered',     badge: 'bg-green-50 text-green-700' },
  RETURNED:      { label: 'Returned',      badge: 'bg-red-50 text-red-600' },
}

interface OrderStatusBadgeProps { status: OrderStatus; size?: 'sm' | 'md' }
interface FulfilmentBadgeProps  { status: FulfilmentStatus; size?: 'sm' | 'md' }

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const { label, dot, badge } = ORDER_CONFIG[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      badge,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} aria-hidden="true" />
      {label}
    </span>
  )
}

export function FulfilmentBadge({ status, size = 'sm' }: FulfilmentBadgeProps) {
  const { label, badge } = FULFILMENT_CONFIG[status]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      badge,
    )}>
      {label}
    </span>
  )
}
