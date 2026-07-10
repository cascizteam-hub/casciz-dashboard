import { cn } from '@/lib/utils'
import type { StoreStatus } from '@/types'

interface Props {
  status: StoreStatus
  size?: 'sm' | 'md'
}

const CONFIG: Record<StoreStatus, { label: string; classes: string }> = {
  DRAFT:     { label: 'Draft',     classes: 'bg-surface-100 text-surface-600' },
  PUBLISHED: { label: 'Published', classes: 'bg-green-100 text-green-700' },
  ARCHIVED:  { label: 'Archived',  classes: 'bg-surface-100 text-surface-500' },
}

export default function StoreStatusBadge({ status, size = 'sm' }: Props) {
  const { label, classes } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        classes,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full flex-shrink-0',
          status === 'PUBLISHED' ? 'bg-green-500' :
          status === 'DRAFT'     ? 'bg-surface-400' :
                                   'bg-surface-300',
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
