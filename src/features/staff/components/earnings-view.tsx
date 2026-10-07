'use client'

import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { EARNINGS_RANGES, parseEarningsRange } from '../earnings.params'
import { useEarningsSeries } from '../earnings.queries'
import { EarningsOverview } from './earnings-overview'
import { streamsOf } from './earnings-parts'
import { EarningsBodySkeleton } from './earnings-skeleton'

// The staff member's earnings. Work counts once it is finished (a check-out, an ended trip), and the
// range in the URL (?range=) is the single source of truth, so a refresh or a shared link shows the
// same chart. The server page has already prefetched the first load.
export function EarningsView() {
  const query = useQueryParams()
  const session = useSession()
  const range = parseEarningsRange(query.get('range'))
  const option =
    EARNINGS_RANGES.find((candidate) => candidate.value === range) ?? EARNINGS_RANGES[1]
  const { series, isPending, isError, isFetching, retry } = useEarningsSeries(range)
  const { showCare, showTrips } = streamsOf(session.staffType)

  const props = series && {
    series,
    unit: option.unit,
    rangeTitle: option.title,
    showCare,
    showTrips,
    staffType: session.staffType,
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Earnings</h1>
          <p className="text-muted-foreground">
            {showCare && showTrips
              ? 'Care fees count when you check a child out, and trip fares when you end a trip.'
              : showCare
                ? 'A care fee counts when you check a child out.'
                : 'A trip fare counts when you end the trip.'}{' '}
            Fees a guardian&apos;s wallet could not cover were never collected, so they are left
            out.
          </p>
        </header>
      </Reveal>

      <fieldset className="flex min-w-0 flex-wrap gap-2">
        <legend className="sr-only">Period</legend>
        {EARNINGS_RANGES.map(({ value, label }) => {
          const selected = range === value
          return (
            <Button
              key={value}
              type="button"
              variant={selected ? 'default' : 'outline'}
              aria-pressed={selected}
              className="h-10 px-4"
              // The default needs no ?range= in the URL.
              onClick={() =>
                query.set({ range: value === parseEarningsRange(null) ? undefined : value })
              }
            >
              {label}
            </Button>
          )
        })}
      </fieldset>

      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && series && 'opacity-60')}
      >
        {isPending && <EarningsBodySkeleton />}
        {isError && <ListErrorState onRetry={retry} />}
        {props && <EarningsOverview {...props} />}
      </div>
    </div>
  )
}
