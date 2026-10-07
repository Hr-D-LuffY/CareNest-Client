import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { bookingKeys } from '@/features/booking/booking.keys'
import { getBooking } from '@/features/booking/booking.server'
import { BookingDetailView } from '@/features/booking/components/booking-detail-view'
import { roomKeys } from '@/features/room/room.keys'
import { getRoom } from '@/features/room/room.server'
import { transportKeys } from '@/features/transport/transport.keys'
import { getBookingRide } from '@/features/transport/transport.server'
import { ApiError } from '@/lib/api/errors'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Booking' }

type BookingDetailPageProps = {
  params: Promise<{ id: string }>
}

// A booking that does not exist or is not the guardian's (the backend answers 404 for both), or an
// id that is not even a UUID (400), is a 404 page. Any other failure goes to the error boundary.
async function loadBooking(id: string) {
  try {
    return await getBooking(id)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// The booking, its ride and its room (whose staff member is the sitter to rate) are fetched here on
// the server and handed to the client view through the query cache. The ride and the room are
// extras: if one fails the page still shows, and the client view fetches it again with its own
// error message.
export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params
  const booking = await loadBooking(id)

  const queryClient = makeQueryClient()
  queryClient.setQueryData(bookingKeys.detail(id), booking)
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: transportKeys.forBooking(id),
      queryFn: () => getBookingRide(id),
    }),
    queryClient.prefetchQuery({
      queryKey: roomKeys.detail(booking.room.id),
      queryFn: () => getRoom(booking.room.id),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingDetailView bookingId={id} />
    </HydrationBoundary>
  )
}
