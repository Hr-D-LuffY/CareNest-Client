import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/reveal'
import { StarRating } from '@/components/shared/star-rating'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { PriceCalculator } from '@/features/room/components/price-calculator'
import { RoomInfo } from '@/features/room/components/room-info'
import { RoomSessions } from '@/features/room/components/room-sessions'
import { parseSessionDateParam, upcomingSessions, weekdayOf } from '@/features/room/room.params'
import { getRoom } from '@/features/room/room.server'
import { StaffProfileCard } from '@/features/staff/components/staff-profile-card'
import { StaffReviews } from '@/features/staff/components/staff-reviews'
import { staffKeys } from '@/features/staff/staff.keys'
import { REVIEWS_PAGE_SIZE } from '@/features/staff/staff.params'
import { getStaffAvailability, getStaffRatings } from '@/features/staff/staff.server'
import { ApiError } from '@/lib/api/errors'
import { DEFAULT_PAGE } from '@/lib/constants'
import { makeQueryClient } from '@/lib/query-client'
import { FRESH_SURFACE } from '@/lib/surfaces'
import { RoomStatus } from '@/types'

export const metadata: Metadata = { title: 'Care room' }

type RoomDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// A room that does not exist, or an id that is not even a UUID (the backend answers 400), is a
// 404 page. Any other failure goes to the error boundary.
async function loadRoom(id: string, date?: string) {
  try {
    return await getRoom(id, date)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// The staff extras are not essential: if one fails the room still shows, with a message in its own
// section. A signed-out session is still an error, so the usual redirect can run.
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) throw error
    return null
  }
}

// ?date= picks a session (it must be a coming date on the room's weekday, else it is ignored) and
// ?page= is the page of reviews. The room, the staff member's weekly hours and the first reviews are
// fetched here on the server; the reviews then belong to the client list, which pages them.
export default async function RoomDetailPage({ params, searchParams }: RoomDetailPageProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams])

  const nextRoom = await loadRoom(id)
  const requested = parseSessionDateParam(first(raw.date))
  const picked =
    requested && requested !== nextRoom.sessionDate && weekdayOf(requested) === nextRoom.dayOfWeek
      ? requested
      : undefined

  const pageNumber = Number(first(raw.page))
  const ratingsParams = {
    page: Number.isInteger(pageNumber) && pageNumber >= DEFAULT_PAGE ? pageNumber : DEFAULT_PAGE,
    limit: REVIEWS_PAGE_SIZE,
  }
  const staffId = nextRoom.staff.id

  const [room, ratings, availability] = await Promise.all([
    picked ? loadRoom(id, picked) : nextRoom,
    orNull(getStaffRatings(staffId, ratingsParams)),
    orNull(getStaffAvailability(staffId)),
  ])

  // Hand the reviews to the client list through the query cache. If they failed to load here, the
  // client list fetches them itself and shows its own error state with a retry.
  const queryClient = makeQueryClient()
  if (ratings) queryClient.setQueryData(staffKeys.ratings(staffId, ratingsParams), ratings)

  const selected = picked ?? nextRoom.sessionDate
  const { hourlyRate } = room.staff
  const status = room.seatsLeft > 0 ? RoomStatus.AVAILABLE : RoomStatus.FULL

  const sessionsCard = (
    <RoomSessions
      room={room}
      sessions={upcomingSessions(nextRoom.sessionDate, picked)}
      selected={selected}
    />
  )

  return (
    // Two columns from lg up. Left: the title block, the booking card, then the reviews. Right: who
    // runs the room, a compact About card, and the price calculator last. On a phone they stack in
    // that same order, left column first.
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <Reveal>
          <header className="flex flex-col gap-3">
            <Link
              href="/dashboard/rooms"
              className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              All care rooms
            </Link>
            <h1 className="text-2xl text-balance break-words md:text-3xl">{room.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <TierBadge tier={room.tier} />
                <StatusBadge kind="room" status={status} />
              </div>
              {/* The staff rating, up here so it is seen at once. It jumps to the reviews. */}
              {ratings && (
                <a
                  href="#reviews"
                  className="inline-flex min-h-9 items-center gap-2 rounded-md text-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {ratings.count > 0 ? (
                    <>
                      <StarRating value={ratings.average} />
                      <span className="font-semibold tabular-nums">
                        {ratings.average.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({ratings.count} {ratings.count === 1 ? 'review' : 'reviews'})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No reviews yet</span>
                  )}
                </a>
              )}
            </div>
          </header>
        </Reveal>

        {sessionsCard}

        <HydrationBoundary state={dehydrate(queryClient)}>
          <StaffReviews staffId={staffId} staffName={room.staff.user.name} />
        </HydrationBoundary>
      </div>

      <div className="flex flex-col gap-6">
        <StaffProfileCard
          name={room.staff.user.name}
          staffType={room.staff.staffType}
          roomDay={room.dayOfWeek}
          rating={ratings ? { average: ratings.average, count: ratings.count } : null}
          availability={availability}
        />
        <RoomInfo room={room} surface={FRESH_SURFACE} compact />
        {hourlyRate && (
          <PriceCalculator
            hourlyRate={hourlyRate}
            multiplier={room.priceMultiplier}
            startTime={room.startTime}
            endTime={room.endTime}
          />
        )}
      </div>
    </div>
  )
}
