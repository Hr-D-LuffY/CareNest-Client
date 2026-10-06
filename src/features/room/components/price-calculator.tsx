'use client'

import { Calculator } from 'lucide-react'
import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateFare, hoursBetween } from '@/lib/fare'
import { formatBDT, formatMultiplier } from '@/lib/format'
import { SOFT_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'

// Hours with up to two decimals, like the backend stores them (2.5, 0.75).
const HOURS_PATTERN = /^\d+(\.\d{1,2})?$/
const MAX_HOURS = 24

type PriceCalculatorProps = {
  hourlyRate: string
  multiplier: string
  startTime: string
  endTime: string
}

type HoursResult = { hours: string; error?: undefined } | { hours?: undefined; error: string }

// The typed text as a number of hours, or what is wrong with it.
function readHours(text: string): HoursResult {
  const value = text.trim().replace(',', '.')
  if (!value) return { error: 'Enter the number of hours.' }
  if (!HOURS_PATTERN.test(value)) {
    return { error: 'Use a number like 3 or 2.5 (up to two decimals).' }
  }
  const hours = Number(value)
  if (hours <= 0) return { error: 'Hours must be more than 0.' }
  if (hours > MAX_HOURS) return { error: `Enter ${MAX_HOURS} hours or less.` }
  return { hours: String(hours) }
}

// A small calculator for the room page: the guardian types the hours and sees the care fee. It uses
// this room's own hourly rate and multiplier, so there are no stored example prices. It starts at
// the length of the room's session, which is what the booking estimate is based on.
export function PriceCalculator({
  hourlyRate,
  multiplier,
  startTime,
  endTime,
}: PriceCalculatorProps) {
  const inputId = useId()
  const messageId = useId()
  const sessionHours = Math.round(hoursBetween(startTime, endTime) * 100) / 100
  const [text, setText] = useState(String(sessionHours))

  const { hours, error } = readHours(text)
  const total = hours ? calculateFare(hours, hourlyRate, multiplier) : null

  return (
    <section
      aria-labelledby="price-calculator-heading"
      className={cn(SOFT_SURFACE, 'flex flex-col gap-5 rounded-2xl p-5')}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background/70 text-info ring-1 ring-border"
        >
          <Calculator className="size-5" />
        </span>
        <div className="flex flex-col">
          <h2 id="price-calculator-heading" className="text-xl leading-tight">
            Price calculator
          </h2>
          <p className="text-sm text-muted-foreground">How much for the hours you need?</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>Hours</Label>
        <div className="relative">
          <Input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={messageId}
            className="h-12 rounded-xl bg-background pr-16 text-lg tabular-nums dark:bg-background"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground"
          >
            hours
          </span>
        </div>
        {error ? (
          <p id={messageId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p id={messageId} className="text-xs text-muted-foreground">
            This room&apos;s session is {sessionHours} {sessionHours === 1 ? 'hour' : 'hours'}.
          </p>
        )}
      </div>

      <div aria-live="polite" className="rounded-xl bg-background/70 px-4 py-3 ring-1 ring-border">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Care fee
        </p>
        {total && hours ? (
          <>
            <p className="font-heading text-3xl tabular-nums">{formatBDT(total)}</p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {hours} {hours === '1' ? 'hour' : 'hours'} × {formatBDT(hourlyRate)} ×{' '}
              {formatMultiplier(multiplier)}
            </p>
          </>
        ) : (
          <p className="font-heading text-3xl text-muted-foreground">–</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        An estimate. The final fee is charged at check-out, for the time your child actually stayed.
      </p>
    </section>
  )
}
