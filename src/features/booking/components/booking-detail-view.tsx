'use client'

import { ArrowLeft, CalendarX2, Star } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ListErrorState } from '@/components/shared/list-error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RateStaffCard } from '@/features/rating/components/rate-staff-card'
import { useRoomQuery } from '@/features/room/room.queries'
import { RideSection } from '@/features/transport/components/ride-section'
import { useBookingRideQuery } from '@/features/transport/transport.queries'
import { DAY_LABEL } from '@/lib/constants'
import {
  formatActivityTime,
  formatBDT,
  formatSessionDate,
  formatTimeRange,
  todayIso,
} from '@/lib/format'
import { type Booking, BookingStatus, TransportStatus } from '@/types'
import { useBookingQuery, useCancelBooking } from '../booking.queries'
import { BookingDetailSkeleton } from './booking-detail-skeleton'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right break-words">{children}</dd>
    </div>
  )
}

// The fee rows: what it will cost while the session is to come, what it cost once it is done, and
// nothing for a cancelled booking.
function FeeRows({ booking }: { booking: Booking }) {
  if (booking.status === BookingStatus.CANCELLED) {
    return <Row label="Fee">No charge</Row>
  }
  return (
    <>
      <Row label="Estimated fee">
        <span className="tabular-nums">{formatBDT(booking.estimatedFee)}</span>
      </Row>
      {booking.status === BookingStatus.COMPLETED && booking.finalFee !== null && (
        <Row label="Final fee">
          <span className="font-semibold tabular-nums">{formatBDT(booking.finalFee)}</span>
          {booking.insufficientBalance && (
            <span className="block text-xs text-muted-foreground">
              Your wallet was short when this was charged
            </span>
          )}
        </Row>
      )}
    </>
  )
}

function SummaryCard({ booking, sitterName }: { booking: Booking; sitterName: string | null }) {
  const { room } = booking
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Session</CardTitle>
        <CardDescription>What was booked, and what it costs.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          <Row label="Child">{booking.child.name}</Row>
          <Row label="Room">
            <Link
              href={`/dashboard/rooms/${room.id}`}
              className="rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {room.name}
            </Link>
            {sitterName && (
              <span className="block text-xs text-muted-foreground">Run by {sitterName}</span>
            )}
          </Row>
          <Row label="Session">
            {formatSessionDate(booking.sessionDate)}
            <span className="block text-xs text-muted-foreground">
              Every {DAY_LABEL[room.dayOfWeek]}, {formatTimeRange(room.startTime, room.endTime)}
            </span>
          </Row>
          <Row label="Status">
            <StatusBadge kind="booking" status={booking.status} />
          </Row>
          <FeeRows booking={booking} />
          <Row label="Booked">
            <time dateTime={booking.createdAt}>{formatActivityTime(booking.createdAt)}</time>
          </Row>
        </dl>
      </CardContent>
    </Card>
  )
}

type RatingsCardProps = {
  booking: Booking
  sitter: { id: string; name: string } | null
  sitterState: 'loading' | 'error' | 'ready'
}

// "Rate sitter" once the session is completed, "Rate driver" once the ride is. Until then, say
// when each opens, so the card is never an empty box.
function RatingsCard({ booking, sitter, sitterState }: RatingsCardProps) {
  const rideQuery = useBookingRideQuery(booking.id)
  const ride = rideQuery.data
  const sessionDone = booking.status === BookingStatus.COMPLETED
  const rideDone = ride?.status === TransportStatus.COMPLETED

  function renderSitter() {
    if (!sessionDone) return null
    if (sitterState === 'loading') return <Skeleton className="h-32 rounded-xl" />
    if (sitterState === 'error' || !sitter) {
      return (
        <p role="alert" className="text-sm text-destructive">
          We could not load the sitter for this room, so it cannot be rated right now.
        </p>
      )
    }
    return (
      <RateStaffCard
        bookingId={booking.id}
        staffId={sitter.id}
        staffName={sitter.name}
        kind="sitter"
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Star aria-hidden="true" className="size-5 text-warning" />
          Rate your care
        </CardTitle>
        <CardDescription>
          One rating for each person who looked after {booking.child.name}. Ratings are public and
          help other guardians choose.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {renderSitter()}
        {rideDone && ride && (
          <RateStaffCard
            bookingId={booking.id}
            staffId={ride.driver.id}
            staffName={ride.driver.user.name}
            kind="driver"
          />
        )}
        {!sessionDone && !rideDone && (
          <p className="text-sm text-muted-foreground">
            You can rate the sitter once the session is completed (after check-out), and the driver
            once the ride is completed.
          </p>
        )}
        {sessionDone && !rideDone && ride === null && (
          <p className="text-sm text-muted-foreground">No ride was taken for this session.</p>
        )}
      </CardContent>
    </Card>
  )
}

function CancelBookingButton({ booking }: { booking: Booking }) {
  const cancelBooking = useCancelBooking()
  const [open, setOpen] = useState(false)

  // Active, and the session has not passed. A session that already started is refused by the
  // backend, and that message is shown as a toast.
  const active =
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
  if (!active || booking.sessionDate < todayIso()) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 px-4 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <CalendarX2 aria-hidden="true" />
        Cancel booking
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Cancel ${booking.child.name}'s session on ${formatSessionDate(booking.sessionDate)}?`}
        description="The seat goes back to the room and the top-ranked child on its waitlist is promoted. Cancelling also counts against your waitlist priority for the next 30 days, and any ride requested for this booking is cancelled."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onConfirm={() => {
          cancelBooking.mutate(booking.id)
          setOpen(false)
        }}
      />
    </>
  )
}

// One booking: what was booked, its ride, and the ratings. The server page has already loaded the
// booking and the ride; this view owns them after that, so cancelling a booking or requesting a
// ride updates every card at once.
export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const booking = useBookingQuery(bookingId)
  const roomId = booking.data?.room.id ?? ''
  // The sitter is the room's staff member (the booking has no staff id of its own).
  const room = useRoomQuery(roomId, undefined, roomId !== '')

  if (booking.isPending) return <BookingDetailSkeleton />
  if (booking.isError || !booking.data) {
    return <ListErrorState onRetry={() => booking.refetch()} />
  }

  const data = booking.data
  const sitter = room.data ? { id: room.data.staff.id, name: room.data.staff.user.name } : null
  const sitterState = room.isPending ? 'loading' : room.isError ? 'error' : 'ready'

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-3">
          <Link
            href="/dashboard/bookings"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All bookings
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-2xl text-balance break-words md:text-3xl">
                {data.child.name}&apos;s session
              </h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground">
                <StatusBadge kind="booking" status={data.status} />
                <span>
                  {formatSessionDate(data.sessionDate)},{' '}
                  {formatTimeRange(data.room.startTime, data.room.endTime)}
                </span>
              </p>
            </div>
            <CancelBookingButton booking={data} />
          </div>
        </header>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SummaryCard booking={data} sitterName={sitter?.name ?? null} />
        <div className="flex flex-col gap-6">
          <RideSection booking={data} />
          {data.status !== BookingStatus.CANCELLED && (
            <RatingsCard booking={data} sitter={sitter} sitterState={sitterState} />
          )}
        </div>
      </div>
    </div>
  )
}
