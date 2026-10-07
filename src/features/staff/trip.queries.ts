'use client'

import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { transportApi } from '@/features/transport/transport.api'
import { formatBDT } from '@/lib/format'
import { type Paginated, type StaffTripListParams, TransportStatus, type Trip } from '@/types'
import { staffApi } from './staff.api'
import { staffKeys } from './staff.keys'
import { idOfVariables } from './staff.queries'

// A trip list (and, for the on-the-way one, the active trips) of the driver.
export function useStaffTripsQuery(params: StaffTripListParams) {
  return useQuery({
    queryKey: staffKeys.tripList(params),
    queryFn: ({ signal }) => staffApi.trips(params, signal),
    // Keep showing the old list while another tab or page loads, so switching does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// The status filter of a cached trip list, read back from its query key (['staff', 'trips', params]).
function statusOfList(key: readonly unknown[]): TransportStatus | undefined {
  const params = key[2]
  if (typeof params === 'object' && params !== null && 'status' in params) {
    return Object.values(TransportStatus).find((status) => status === params.status)
  }
  return undefined
}

type TripListSnapshot = [readonly unknown[], Paginated<Trip> | undefined][]

// Applies `update` to every cached trip list, told which status filter that list has, and returns
// what was there before, so a failed request can put it back.
async function updateTripLists(
  queryClient: QueryClient,
  update: (page: Paginated<Trip>, status: TransportStatus | undefined) => Paginated<Trip>,
): Promise<TripListSnapshot> {
  await queryClient.cancelQueries({ queryKey: staffKeys.trips() })
  const previous = queryClient.getQueriesData<Paginated<Trip>>({ queryKey: staffKeys.trips() })
  for (const [key, page] of previous) {
    if (page) queryClient.setQueryData(key, update(page, statusOfList(key)))
  }
  return previous
}

function restoreTripLists(queryClient: QueryClient, previous: TripListSnapshot | undefined) {
  for (const [key, data] of previous ?? []) queryClient.setQueryData(key, data)
}

function withoutTrip(page: Paginated<Trip>, id: string): Paginated<Trip> {
  const items = page.items.filter((trip) => trip.id !== id)
  const removed = page.items.length - items.length
  return { items, meta: { ...page.meta, total: Math.max(0, page.meta.total - removed) } }
}

// Optimistic: the trip leaves "Upcoming" and appears under "On the way" at once, and goes back if the
// backend refuses (409 "A trip can only start on the session date", shown by the global toast).
export function useStartTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: staffKeys.startTrip,
    mutationFn: (trip: Trip) => transportApi.startTrip(trip.id),
    onMutate: async (trip) => {
      const started: Trip = {
        ...trip,
        status: TransportStatus.IN_PROGRESS,
        tripLog: {
          tripStart: new Date().toISOString(),
          tripEnd: null,
          durationMinutes: null,
          fare: null,
        },
      }
      const previous = await updateTripLists(queryClient, (page, status) => {
        if (status === TransportStatus.REQUESTED) return withoutTrip(page, trip.id)
        if (status === TransportStatus.IN_PROGRESS && !page.items.some((t) => t.id === trip.id)) {
          return {
            items: [started, ...page.items],
            meta: { ...page.meta, total: page.meta.total + 1 },
          }
        }
        return page
      })
      return { previous }
    },
    onError: (_error, _trip, context) => restoreTripLists(queryClient, context?.previous),
    onSuccess: (_ride, trip) => toast.success(`Trip started for ${trip.booking.child.name}.`),
    // The refetch swaps the optimistic start time for the one the backend stored.
    onSettled: () => queryClient.invalidateQueries({ queryKey: staffKeys.trips() }),
  })
}

// Optimistic: the trip leaves "On the way" at once and comes back if the backend refuses. The
// backend prices it (base fare + minutes x the driver's rate) and charges the guardian's wallet. If
// the wallet is short it charges nothing and says so, which the toast repeats.
export function useEndTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: staffKeys.endTrip,
    mutationFn: (trip: Trip) => transportApi.endTrip(trip.id),
    onMutate: async (trip) => {
      const previous = await updateTripLists(queryClient, (page, status) =>
        status === TransportStatus.IN_PROGRESS ? withoutTrip(page, trip.id) : page,
      )
      return { previous }
    },
    onError: (_error, _trip, context) => restoreTripLists(queryClient, context?.previous),
    onSuccess: ({ charged, tripLog }, trip) => {
      const name = trip.booking.child.name
      const minutes =
        tripLog?.durationMinutes != null ? ` after ${tripLog.durationMinutes} min` : ''
      const fare = tripLog?.fare != null ? formatBDT(tripLog.fare) : null
      if (charged) {
        toast.success(
          `Trip ended for ${name}${minutes}.${fare ? ` ${fare} charged to the wallet.` : ''}`,
        )
      } else {
        toast.warning(
          `Trip ended for ${name}${minutes}. The guardian's wallet was short${fare ? `, so ${fare} was not charged` : ''}.`,
        )
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: staffKeys.trips() }),
  })
}

// Trips with a start or end request still running. Their buttons are disabled, so a quick double tap
// cannot turn a "Start trip" into an immediate "End trip".
export function useBusyTripIds(): ReadonlySet<string> {
  const ids = useMutationState({
    filters: { mutationKey: staffKeys.tripActions, status: 'pending' },
    select: (mutation) => idOfVariables(mutation.state.variables),
  })
  return new Set(ids.filter((id): id is string => id !== null))
}
