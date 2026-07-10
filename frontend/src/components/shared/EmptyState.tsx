import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  icon:        ReactNode
  title:       string
  description: string
  action?:     ReactNode
  className?:  string
}

export default function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 mb-4">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
