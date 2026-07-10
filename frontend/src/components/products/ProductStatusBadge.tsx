import { cn } from '@/lib/utils'
import type { ProductStatus } from '@/types'

const CONFIG: Record<ProductStatus, { label: string; dot: string; badge: string }> = {
  DRAFT:    { label: 'Draft',    dot: 'bg-surface-400', badge: 'bg-surface-100 text-surface-600' },
  ACTIVE:   { label: 'Active',   dot: 'bg-green-500',   badge: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Archived', dot: 'bg-surface-300', badge: 'bg-surface-100 text-surface-400' },
}

interface Props {
  status:  ProductStatus
  size?:   'sm' | 'md'
}

export default function ProductStatusBadge({ status, size = 'sm' }: Props) {
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
