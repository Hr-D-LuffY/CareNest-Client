import { DEFAULT_PAGE } from '@/lib/constants'
import { addDaysIso, todayIso } from '@/lib/format'
import { DAYS_OF_WEEK, type DayOfWeek, type RoomListParams, RoomStatus, Tier } from '@/types'

// Rooms shown per page (three cards a row on a wide screen).
const ROOMS_PAGE_SIZE = 9

// Longest search text kept in the URL.
const MAX_SEARCH_LENGTH = 100

// What the "Sort by" menu offers, and the backend's sortBy / sortOrder each one means.
export const ROOM_SORTS = [
  { value: 'newest', label: 'Recently added', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'seats', label: 'Most seats left', sortBy: 'seatsLeft', sortOrder: 'desc' },
  { value: 'name', label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
  { value: 'start', label: 'Earliest start time', sortBy: 'startTime', sortOrder: 'asc' },
  { value: 'price-asc', label: 'Price: low to high', sortBy: 'priceMultiplier', sortOrder: 'asc' },
  {
    value: 'price-desc',
    label: 'Price: high to low',
    sortBy: 'priceMultiplier',
    sortOrder: 'desc',
  },
] as const

export type RoomSort = (typeof ROOM_SORTS)[number]['value']

// What the page shows, read from the URL (?q=&tier=&status=&day=&date=&sort=&page=).
export type RoomViewParams = {
  page: number
  sort: RoomSort
  q?: string
  tier?: Tier
  status?: RoomStatus
  day?: DayOfWeek
  // A session date, "YYYY-MM-DD". Seats are counted for this day instead of each room's next one.
  date?: string
}

const TIERS: readonly Tier[] = Object.values(Tier)
const STATUSES: readonly RoomStatus[] = Object.values(RoomStatus)

// Index = Date#getUTCDay(), the same table the backend uses to match a date to a room's day.
const WEEKDAYS_FROM_SUNDAY: readonly DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

// The day of the week a "YYYY-MM-DD" session date falls on.
export function weekdayOf(date: string): DayOfWeek {
  return WEEKDAYS_FROM_SUNDAY[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? 'MONDAY'
}

// A real calendar day that is not in the past. The backend answers 400 for anything else
// ("Date cannot be in the past"), so a hand-edited URL is dropped here instead.
function isUpcomingDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  const isRealDay = !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
  return isRealDay && date >= todayIso()
}

// A session date from the URL (?date=), or undefined when it is missing, not a real day or in the
// past. The backend would answer 400 for those.
export function parseSessionDateParam(raw: string | null | undefined): string | undefined {
  return raw && isUpcomingDate(raw) ? raw : undefined
}

// How many upcoming sessions the detail page offers to pick from.
const SESSION_CHOICES = 4
const DAYS_IN_WEEK = 7

// A room repeats every week: its next few session dates, starting from `nextSession` (the date the
// backend reports for the room), plus the picked date when it is a later one.
export function upcomingSessions(nextSession: string, picked?: string): string[] {
  const dates = Array.from({ length: SESSION_CHOICES }, (_, week) =>
    addDaysIso(nextSession, week * DAYS_IN_WEEK),
  )
  return picked && !dates.includes(picked) ? [...dates, picked] : dates
}

// The view's params from the raw URL values. A hand-edited URL falls back to "page 1, no filter"
// instead of reaching the backend as a 400. Both the server page (prefetch) and the client list
// call this, so they build the same query key.
export function parseRoomViewParams(raw: {
  page?: string | null
  q?: string | null
  tier?: string | null
  status?: string | null
  day?: string | null
  date?: string | null
  sort?: string | null
}): RoomViewParams {
  const page = Number(raw.page)
  const q = raw.q?.trim().slice(0, MAX_SEARCH_LENGTH)
  const tier = TIERS.find((option) => option === raw.tier)
  const status = STATUSES.find((option) => option === raw.status)
  const date = raw.date && isUpcomingDate(raw.date) ? raw.date : undefined
  // A date already fixes the weekday, and the backend refuses a day that disagrees with it, so
  // the date wins.
  const day = date ? undefined : DAYS_OF_WEEK.find((option) => option === raw.day)
  const sort = ROOM_SORTS.find((option) => option.value === raw.sort)?.value ?? 'newest'
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    sort,
    ...(q && { q }),
    ...(tier && { tier }),
    ...(status && { status }),
    ...(day && { day }),
    ...(date && { date }),
  }
}

// The backend's query for a view: filtering, sorting and paging are all done there.
export function toRoomListParams(
  { page, sort, q, tier, status, day, date }: RoomViewParams,
  limit: number = ROOMS_PAGE_SIZE,
): RoomListParams {
  const { sortBy, sortOrder } = ROOM_SORTS.find((option) => option.value === sort) ?? ROOM_SORTS[0]
  return {
    page,
    limit,
    sortBy,
    sortOrder,
    ...(q && { q }),
    ...(tier && { tier }),
    ...(status && { status }),
    ...(day && { dayOfWeek: day }),
    ...(date && { date }),
  }
}

// The URL params that are filters, for "Clear filters" (the sort stays).
export const ROOM_FILTER_KEYS = ['q', 'tier', 'status', 'day', 'date'] as const

// True when any filter (not the sort or the page) is applied.
export function hasRoomFilters({ q, tier, status, day, date }: RoomViewParams): boolean {
  return Boolean(q || tier || status || day || date)
}
