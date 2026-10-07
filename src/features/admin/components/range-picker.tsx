'use client'

import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ANALYTICS_RANGES, DEFAULT_ANALYTICS_RANGE, parseAnalyticsRange } from '../analytics.params'

// The period the money and activity charts cover. The URL (?range=) is the single source of truth,
// so a refresh or a shared link shows the same board.
export function RangePicker() {
  const query = useQueryParams()
  const range = parseAnalyticsRange(query.get('range'))

  return (
    <fieldset className="flex min-w-0 flex-wrap gap-2">
      <legend className="sr-only">Period</legend>
      {ANALYTICS_RANGES.map(({ value, label }) => {
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
              query.set({ range: value === DEFAULT_ANALYTICS_RANGE ? undefined : value })
            }
          >
            {label}
          </Button>
        )
      })}
    </fieldset>
  )
}
