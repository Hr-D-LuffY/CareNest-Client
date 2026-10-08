import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type WizardProgressProps = {
  // The steps in order, numbered from 1.
  steps: readonly { step: number; label: string }[]
  step: number
  // Names the navigation for screen readers, e.g. "Booking progress".
  label: string
}

// "Step 2 of 3" as three labelled stages (the layout is a three-column grid, so give it three
// steps). The current one is marked for screen readers (aria-current="step") and finished ones
// carry a check mark, so progress never relies on colour. Plain markup with no hooks.
export function WizardProgress({ steps, step, label }: WizardProgressProps) {
  return (
    <nav aria-label={label}>
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map(({ step: number, label: stepLabel }) => {
          const done = number < step
          const current = number === step
          return (
            <li
              key={number}
              aria-current={current ? 'step' : undefined}
              className="flex flex-col gap-2"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 rounded-full transition-colors',
                  done || current ? 'bg-cta' : 'bg-muted',
                )}
              />
              <span className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    done || current
                      ? 'bg-cta text-cta-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-3.5" /> : number}
                </span>
                <span
                  className={cn('min-w-0', current ? 'font-semibold' : 'text-muted-foreground')}
                >
                  <span className="sr-only">
                    Step {number} of {steps.length}:{' '}
                  </span>
                  {stepLabel}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
