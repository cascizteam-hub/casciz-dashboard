import { cn } from '@/lib/utils'
import type { CheckoutStatus } from '@/types'

const CONFIG: Record<CheckoutStatus, { label: string; dot: string; badge: string }> = {
  OPEN:        { label: 'Open',        dot: 'bg-primary-500', badge: 'bg-primary-50 text-primary-700' },
  PROCESSING:  { label: 'Processing',  dot: 'bg-yellow-400',  badge: 'bg-yellow-50 text-yellow-700' },
  COMPLETED:   { label: 'Completed',   dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700' },
  ABANDONED:   { label: 'Abandoned',   dot: 'bg-surface-300', badge: 'bg-surface-100 text-surface-500' },
  FAILED:      { label: 'Failed',      dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700' },
}

interface Props {
  status: CheckoutStatus
  size?:  'sm' | 'md'
}

export default function CheckoutStatusBadge({ status, size = 'sm' }: Props) {
  const { label, dot, badge } = CONFIG[status]
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
