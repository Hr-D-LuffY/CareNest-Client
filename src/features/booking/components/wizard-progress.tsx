import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WIZARD_STEPS, type WizardStep } from '../booking.params'

// "Step 2 of 3" as three labelled stages. The current one is marked for screen readers
// (aria-current="step") and finished ones carry a check mark, so progress never relies on colour.
export function WizardProgress({ step }: { step: WizardStep }) {
  return (
    <nav aria-label="Booking progress">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {WIZARD_STEPS.map(({ step: number, label }) => {
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
                    Step {number} of {WIZARD_STEPS.length}:{' '}
                  </span>
                  {label}
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
