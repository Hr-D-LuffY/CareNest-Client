import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { EarningsView } from '@/features/staff/components/earnings-view'
import { buildEarningsPeriods, parseEarningsRange } from '@/features/staff/earnings.params'
import { staffKeys } from '@/features/staff/staff.keys'
import { getStaffEarnings } from '@/features/staff/staff.server'
import { todayInAppZone } from '@/lib/format'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Earnings' }

type EarningsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// What the staff member earned. Every staff type has earnings (a sitter's care fees, a driver's trip
// fares, or both), so there is no redirect here.
//
// The backend totals one window per request, so a chart needs one request per period. They are
// fetched here, on the server, for the range in the URL and handed to the client view through the
// query cache, so the chart's numbers are there on the first paint.
export default async function StaffEarningsPage({ searchParams }: EarningsPageProps) {
  const raw = await searchParams
  const range = parseEarningsRange(first(raw.range))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await Promise.all(
    buildEarningsPeriods(range, todayInAppZone()).map((period) => {
      const window = { from: period.from, to: period.to }
      return queryClient.prefetchQuery({
        queryKey: staffKeys.earningsWindow(window),
        queryFn: () => getStaffEarnings(window),
      })
    }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EarningsView />
    </HydrationBoundary>
  )
}
