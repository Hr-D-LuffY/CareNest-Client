import 'server-only'
import { type Loaded, mapLoaded, settle } from '@/lib/api/loaded'
import { serverApi } from '@/lib/api/server'
import { todayIso } from '@/lib/format'
import type { Paginated } from '@/types/api'
import type { Booking } from '@/types/booking'
import type { Child } from '@/types/child'
import { BookingStatus, TransportStatus } from '@/types/enums'
import type { Transport } from '@/types/transport'
import type { GuardianProfile } from '@/types/user'
import type { WalletTransaction } from '@/types/wallet'

export type GuardianOverview = {
  profile: Loaded<GuardianProfile>
  childCount: Loaded<number>
  // Confirmed sessions that are not in the past: how many, and all of them (soonest first).
  upcoming: Loaded<{ total: number; all: Booking[] }>
  // How many bookings the guardian has ever made (any status).
  bookingCount: Loaded<number>
  transactions: Loaded<WalletTransaction[]>
  activeRideCount: Loaded<number>
}

const MAX_PAGE_SIZE = 100
const RECENT_TRANSACTIONS = 5

// The signed-in guardian's profile, with the wallet balance.
export const getGuardianProfile = () => serverApi.get<GuardianProfile>('/guardian/me')

// Everything the guardian overview needs, fetched in parallel. Bookings come newest session first,
// so one page of 100 holds every upcoming session unless there are more than 100 of them.
export async function getGuardianOverview(): Promise<GuardianOverview> {
  const [profile, children, bookings, transactions, rides] = await Promise.allSettled([
    serverApi.get<GuardianProfile>('/guardian/me'),
    serverApi.getList<Child>('/child', { limit: MAX_PAGE_SIZE }),
    serverApi.getList<Booking>('/booking', { limit: MAX_PAGE_SIZE }),
    serverApi.getList<WalletTransaction>('/wallet/transactions', { limit: RECENT_TRANSACTIONS }),
    serverApi.getList<Transport>('/transport', { limit: MAX_PAGE_SIZE }),
  ])

  const today = todayIso()
  const childPage = settle(children)
  const bookingList: Loaded<Paginated<Booking>> = settle(bookings)

  return {
    profile: settle(profile),
    childCount: mapLoaded(childPage, (page) => page.meta.total),
    upcoming: mapLoaded(bookingList, (page) => {
      const sessions = page.items
        .filter((b) => b.status === BookingStatus.CONFIRMED && b.sessionDate >= today)
        .sort(
          (a, b) =>
            a.sessionDate.localeCompare(b.sessionDate) ||
            a.room.startTime.localeCompare(b.room.startTime),
        )
      return { total: sessions.length, all: sessions }
    }),
    bookingCount: mapLoaded(bookingList, (page) => page.meta.total),
    transactions: mapLoaded(settle(transactions), (page) => page.items),
    activeRideCount: mapLoaded(
      settle(rides),
      (page) =>
        page.items.filter(
          (ride) =>
            ride.status === TransportStatus.REQUESTED ||
            ride.status === TransportStatus.IN_PROGRESS,
        ).length,
    ),
  }
}
