import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-destructive-soft text-destructive',
}

type OutcomeViewProps = {
  icon: LucideIcon
  tone: Tone
  title: string
  description: string
  // Facts about what happened (amount, child, date). Left out when there are none.
  details?: { label: string; value: ReactNode }[]
  // Anything else worth reading before the buttons, e.g. how a waitlist score works.
  body?: ReactNode
  // The buttons or links.
  children: ReactNode
}

// The result of an action (a top-up, a booking), centred in the content area: an icon, what happened,
// the facts, and where to go next. Plain markup with no hooks, so the server pages render it directly. The icon has a
// shape as well as a colour, and the title says the outcome in words.
export function OutcomeView({
  icon: Icon,
  tone,
  title,
  description,
  details,
  body,
  children,
}: OutcomeViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-8 text-center sm:py-14">
      <span
        aria-hidden="true"
        className={cn('grid size-16 place-items-center rounded-3xl', TONE_CLASSES[tone])}
      >
        <Icon className="size-8" />
      </span>
      <h1 className="text-3xl text-balance sm:text-4xl">{title}</h1>
      <p className="text-base text-pretty text-muted-foreground">{description}</p>

      {details && details.length > 0 && (
        <dl className="flex w-full flex-col divide-y rounded-2xl border bg-card px-5 text-left shadow-soft">
          {details.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 text-right font-medium tabular-nums break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {body}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">{children}</div>
    </div>
  )
}

// The loading shape of OutcomeView, for the loading.tsx of result pages.
export function OutcomeSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-8 sm:py-14"
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="size-16 rounded-3xl" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-11 w-40 rounded-lg" />
    </div>
  )
}
