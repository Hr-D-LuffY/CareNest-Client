'use client'

import { useQueries } from '@tanstack/react-query'
import { todayInAppZone } from '@/lib/format'
import { buildEarningsPeriods, type EarningsRange } from './earnings.params'
import { buildEarningsSeries } from './earnings-model'
import { staffApi } from './staff.api'
import { staffKeys } from './staff.keys'

// The earnings of every period in a range (a day, a week or a month each): one request per period,
// because the backend only totals a whole window. They load side by side, so the chart appears once
// all of them are in. The server page has already prefetched them.
export function useEarningsSeries(range: EarningsRange) {
  const periods = buildEarningsPeriods(range, todayInAppZone())
  const results = useQueries({
    queries: periods.map((period) => {
      const window = { from: period.from, to: period.to }
      return {
        queryKey: staffKeys.earningsWindow(window),
        queryFn: ({ signal }: { signal: AbortSignal }) => staffApi.earnings(window, signal),
        // The page shows one error state with a retry, not a toast for every failed period.
        meta: { skipGlobalError: true },
      }
    }),
  })

  const answers = results.flatMap((result) => (result.data ? [result.data] : []))
  const series =
    answers.length === periods.length ? buildEarningsSeries(periods, answers) : undefined

  return {
    series,
    isPending: !series && !results.some((result) => result.isError),
    isError: !series && results.some((result) => result.isError),
    isFetching: results.some((result) => result.isFetching),
    retry: () => {
      for (const result of results) if (result.isError) result.refetch()
    },
  }
}
