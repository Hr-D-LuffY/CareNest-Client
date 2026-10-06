import { DEFAULT_PAGE } from '@/lib/constants'
import {
  type BookingListParams,
  BookingStatus,
  type WaitlistListParams,
  WaitlistStatus,
} from '@/types'

// Rows shown per page, in both the bookings and the waitlist tab.
export const BOOKINGS_PAGE_SIZE = 10

// The tabs of the bookings page, and what each one asks the backend for. "Waitlisted" is not a
// booking status: a waitlist spot is its own record, read from its own endpoint.
export const BOOKING_TABS = [
  { value: 'all', label: 'All', status: undefined },
  { value: 'confirmed', label: 'Confirmed', status: BookingStatus.CONFIRMED },
  { value: 'waitlist', label: 'Waitlisted', status: undefined },
  { value: 'completed', label: 'Completed', status: BookingStatus.COMPLETED },
  { value: 'cancelled', label: 'Cancelled', status: BookingStatus.CANCELLED },
] as const

export type BookingTab = (typeof BOOKING_TABS)[number]['value']

// What the page shows, read from the URL (?tab=&page=).
export type BookingViewParams = {
  page: number
  tab: BookingTab
}

// The view's params from the raw URL values. A hand-edited URL falls back to "All, page 1" instead
// of reaching the backend as a 400. Both the server page (prefetch) and the client list call this,
// so they build the same query key.
export function parseBookingViewParams(raw: {
  page?: string | null
  tab?: string | null
}): BookingViewParams {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    tab: BOOKING_TABS.find((option) => option.value === raw.tab)?.value ?? 'all',
  }
}

// The backend's query for a booking tab: filtering and paging are done there.
export function toBookingListParams({ page, tab }: BookingViewParams): BookingListParams {
  const status = BOOKING_TABS.find((option) => option.value === tab)?.status
  return { page, limit: BOOKINGS_PAGE_SIZE, ...(status && { status }) }
}

// The waitlist tab shows the queue the guardian is still in. A spot that was promoted is a booking
// by then (see Confirmed), and expired or cancelled spots are history.
export function toWaitlistListParams({ page }: BookingViewParams): WaitlistListParams {
  return { page, limit: BOOKINGS_PAGE_SIZE, status: WaitlistStatus.PENDING }
}
