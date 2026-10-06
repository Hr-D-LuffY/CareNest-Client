import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { bookingKeys } from '@/features/booking/booking.keys'
import { getBookingsPage, getWaitlistPage } from '@/features/booking/booking.server'
import {
  parseBookingViewParams,
  toBookingListParams,
  toWaitlistListParams,
} from '@/features/booking/booking-list.params'
import { BookingsView } from '@/features/booking/components/bookings-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Bookings' }

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The list for the tab and page in the URL is fetched here, on the server, and handed to the client
// view through the query cache, so the first paint already has the rows. After that the client view
// owns it (tabs, paging, optimistic cancel).
export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const raw = await searchParams
  const view = parseBookingViewParams({ page: first(raw.page), tab: first(raw.tab) })

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  if (view.tab === 'waitlist') {
    const params = toWaitlistListParams(view)
    await queryClient.prefetchQuery({
      queryKey: bookingKeys.waitlist(params),
      queryFn: () => getWaitlistPage(params),
    })
  } else {
    const params = toBookingListParams(view)
    await queryClient.prefetchQuery({
      queryKey: bookingKeys.list(params),
      queryFn: () => getBookingsPage(params),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingsView />
    </HydrationBoundary>
  )
}
