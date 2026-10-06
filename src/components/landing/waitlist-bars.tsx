'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// The backend's formula (waitlist.service.ts):
//   priorityScore = 0.5 × hours waited + 0.3 × tier weight − 0.4 × recent cancellations
// with tier weights Monthly 3, Weekly 2, Daily 1. Repeated here only to draw a worked example, so
// the numbers below are computed, not typed in.
const WEIGHT_WAIT = 0.5
const WEIGHT_TIER = 0.3
const WEIGHT_CANCELLATION = 0.4
const WEEKLY_TIER_WEIGHT = 2

const EXAMPLES = [
  { label: 'Waited 4 hours · Weekly tier · no cancellations', hours: 4, cancellations: 0 },
  { label: 'Waited 4 hours · Weekly tier · 2 recent cancellations', hours: 4, cancellations: 2 },
] as const

function breakdown(hours: number, cancellations: number) {
  const wait = WEIGHT_WAIT * hours
  const tier = WEIGHT_TIER * WEEKLY_TIER_WEIGHT
  const penalty = WEIGHT_CANCELLATION * cancellations
  return { wait, tier, penalty, score: wait + tier - penalty }
}

const FULL_SCALE = breakdown(EXAMPLES[0].hours, EXAMPLES[0].cancellations).score

function percent(value: number) {
  // Rounded, so the server and the browser print the same number.
  return `${Number(((Math.max(value, 0) / FULL_SCALE) * 100).toFixed(2))}%`
}

function Segment({
  left,
  width,
  className,
  delay,
}: {
  left: number
  width: number
  className: string
  delay: number
}) {
  const reduce = usePrefersReducedMotion()
  return (
    <motion.span
      aria-hidden="true"
      className={cn('absolute inset-y-0 origin-left', className)}
      style={{ left: percent(left), width: percent(width) }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: reduce ? 0 : 0.7, ease: 'easeOut', delay: reduce ? 0 : delay }}
    />
  )
}

function Example({
  label,
  hours,
  cancellations,
  index,
}: (typeof EXAMPLES)[number] & { index: number }) {
  const { wait, tier, penalty, score } = breakdown(hours, cancellations)
  // The bar is drawn left to right: waiting time, then tier. Cancellations take points off the end,
  // and the points that were taken away are shown as the dashed gap.
  const waitShown = Math.min(wait, score)
  const tierShown = Math.max(0, Math.min(tier, score - wait))
  const lost = wait + tier - score
  const delay = index * 0.25

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-pretty text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl tabular-nums">
          <span className="sr-only">Priority score </span>
          {score.toFixed(1)}
        </p>
      </div>
      <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <Segment left={0} width={waitShown} className="bg-info" delay={delay} />
        <Segment left={wait} width={tierShown} className="bg-success" delay={delay + 0.15} />
        {penalty > 0 && (
          <Segment
            left={wait + tier - lost}
            width={lost}
            className="border border-dashed border-warning bg-warning-soft"
            delay={delay + 0.3}
          />
        )}
      </div>
    </div>
  )
}

// A card that shows the formula and two worked examples as bars. A concept drawing, labelled as such.
export function WaitlistBars() {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-float sm:p-8">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Priority score
      </p>
      <p className="mt-3 text-base leading-loose text-pretty sm:text-lg">
        <span className="inline-block whitespace-nowrap rounded-md bg-info-soft px-2 py-0.5 font-medium text-info">
          0.5 × hours waited
        </span>{' '}
        +{' '}
        <span className="inline-block whitespace-nowrap rounded-md bg-success-soft px-2 py-0.5 font-medium text-success">
          0.3 × tier weight
        </span>{' '}
        −{' '}
        <span className="inline-block whitespace-nowrap rounded-md bg-warning-soft px-2 py-0.5 font-medium text-warning">
          0.4 × recent cancellations
        </span>
      </p>

      <div className="mt-8 flex flex-col gap-6 border-t pt-6">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Worked example
        </p>
        {EXAMPLES.map((example, index) => (
          <Example key={example.label} {...example} index={index} />
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-info" />
          Waiting time
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
          Tier
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full border border-dashed border-warning bg-warning-soft"
          />
          Points lost to cancellations
        </li>
      </ul>
    </div>
  )
}
