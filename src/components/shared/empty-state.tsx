import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  // The next step: a link or button (e.g. "Add a child"). Leave out when there is nothing to do.
  action?: ReactNode
  // Drop the dashed frame when the state already sits inside a card or table.
  bare?: boolean
  className?: string
}

// "Nothing here" for lists, tables and tabs: an icon, what is missing, and what to do about it.
// Plain markup with no hooks, so Server and Client Components can both render it.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bare = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-12 text-center',
        !bare && 'rounded-xl border border-dashed bg-card/50',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-info-soft text-info"
      >
        <Icon className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-lg text-balance">{title}</h3>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {action && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>
      )}
    </div>
  )
}
