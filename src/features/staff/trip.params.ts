import { DEFAULT_PAGE, MAX_PAGE_SIZE } from '@/lib/constants'
import { type StaffTripListParams, TransportStatus } from '@/types'

// The tabs of the trips page, and the status each one asks the backend for. A trip that is on the
// way is not a tab: it is always shown above them (see ON_THE_WAY_PARAMS).
export const TRIP_TABS = [
  { value: 'upcoming', label: 'Upcoming', status: TransportStatus.REQUESTED },
  { value: 'completed', label: 'Completed', status: TransportStatus.COMPLETED },
  { value: 'cancelled', label: 'Cancelled', status: TransportStatus.CANCELLED },
] as const

export type TripTab = (typeof TRIP_TABS)[number]['value']

// Rows per page in the history tabs. Upcoming loads in one go instead, so it can be grouped by day.
export const HISTORY_PAGE_SIZE = 10

// The trips the driver has started and not yet ended. Always loaded, whatever tab is open, because a
// child who is on the way has to be dropped off and the trip ended.
export const ON_THE_WAY_PARAMS: StaffTripListParams = {
  page: 1,
  limit: MAX_PAGE_SIZE,
  status: TransportStatus.IN_PROGRESS,
}

// What the page shows, read from the URL (?tab=&page=).
export type TripViewParams = {
  page: number
  tab: TripTab
}

// The view's params from the raw URL values. A hand-edited URL falls back to "Upcoming, page 1"
// instead of reaching the backend as a 400. Both the server page (prefetch) and the client list call
// this, so they build the same query key.
export function parseTripViewParams(raw: {
  page?: string | null
  tab?: string | null
}): TripViewParams {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    tab: TRIP_TABS.find((option) => option.value === raw.tab)?.value ?? 'upcoming',
  }
}

// The backend's query for a tab. Upcoming is one page of up to 100 (sorted by day on the client);
// the history tabs page on the server.
export function toTripListParams({ page, tab }: TripViewParams): StaffTripListParams {
  const status = TRIP_TABS.find((option) => option.value === tab)?.status
  return tab === 'upcoming'
    ? { page: DEFAULT_PAGE, limit: MAX_PAGE_SIZE, status }
    : { page, limit: HISTORY_PAGE_SIZE, status }
}
