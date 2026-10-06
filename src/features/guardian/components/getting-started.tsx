import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type GettingStartedStep = {
  id: string
  title: string
  description: string
  href: string
  action: string
  done: boolean
}

// A short checklist for a new guardian: add a child, top up, book. The page hides it once all
// three are done, and each open step is a link, so there is always one obvious next click.
export function GettingStarted({ steps }: { steps: GettingStartedStep[] }) {
  const doneCount = steps.filter((step) => step.done).length
  const nextStep = steps.find((step) => !step.done)

  return (
    <section
      aria-labelledby="getting-started-title"
      className="rounded-3xl border bg-linear-to-br from-info-soft via-card to-card p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="getting-started-title" className="font-heading text-xl">
            Get started with CareNest
          </h2>
          <p className="text-sm text-muted-foreground">
            Three quick steps and your child has a seat.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums">
          {doneCount} of {steps.length} done
        </p>
      </div>

      <div aria-hidden="true" className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-cta transition-[width] duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'flex flex-col gap-3 rounded-2xl border bg-card p-4',
              step === nextStep && 'ring-2 ring-cta/60',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  step.done ? 'bg-success text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                {step.done ? <Check className="size-4" /> : index + 1}
              </span>
              <h3 className="font-heading text-base">
                {step.title}
                {step.done && <span className="sr-only"> (done)</span>}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {!step.done && (
              <Link
                href={step.href}
                className="mt-auto inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-info hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {step.action}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
