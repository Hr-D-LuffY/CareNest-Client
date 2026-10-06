import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatCardProps = {
  icon: LucideIcon
  label: string
  // The big number or amount. Pass "—" when it could not be loaded.
  value: ReactNode
  // One short line under the value: what it means or what to do next.
  hint?: string
  // Makes the whole card a link to where the number comes from.
  href?: string
  className?: string
}

// One headline number on a dashboard: icon, label, value and a hint. Plain markup with no hooks,
// so Server and Client Components can both render it.
export function StatCard({ icon: Icon, label, value, hint, href, className }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-info-soft text-info"
        >
          <Icon className="size-5" />
        </span>
        {href && (
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover/stat:translate-x-0.5 group-hover/stat:-translate-y-0.5"
          />
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl tabular-nums sm:text-3xl">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </>
  )

  const classes = cn(
    'group/stat block h-full rounded-2xl border bg-card p-4 shadow-soft sm:p-5',
    href &&
      'transition-shadow outline-none hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/50',
    className,
  )

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  )
}
