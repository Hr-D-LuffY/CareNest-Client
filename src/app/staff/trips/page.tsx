import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TripsView } from '@/features/staff/components/trips-view'
import { staffKeys } from '@/features/staff/staff.keys'
import { getMyStaffProfile, getStaffTripsPage } from '@/features/staff/staff.server'
import {
  ON_THE_WAY_PARAMS,
  parseTripViewParams,
  toTripListParams,
} from '@/features/staff/trip.params'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Trips' }

type TripsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The driver's trips. Rides belong to drivers, so a sitter (whom the backend would answer with a
// 403) goes back to their tasks.
//
// The trips on the way, the list for the tab in the URL, and the driver's own rate are fetched here,
// on the server, and handed to the client view through the query cache, so the first paint already
// has them.
export default async function StaffTripsPage({ searchParams }: TripsPageProps) {
  const session = await getSession()
  if (session?.staffType === StaffType.SITTER) redirect('/staff')

  const raw = await searchParams
  const view = parseTripViewParams({ page: first(raw.page), tab: first(raw.tab) })
  const listParams = toTripListParams(view)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: staffKeys.tripList(ON_THE_WAY_PARAMS),
      queryFn: () => getStaffTripsPage(ON_THE_WAY_PARAMS),
    }),
    queryClient.prefetchQuery({
      queryKey: staffKeys.tripList(listParams),
      queryFn: () => getStaffTripsPage(listParams),
    }),
    queryClient.prefetchQuery({ queryKey: staffKeys.me(), queryFn: getMyStaffProfile }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TripsView />
    </HydrationBoundary>
  )
}
