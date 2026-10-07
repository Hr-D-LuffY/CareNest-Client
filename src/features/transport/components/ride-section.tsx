'use client'

import { Bus, CalendarX2, Plus } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TRANSPORT_BASE_FARE, VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatActivityTime, formatBDT, formatSessionDate, todayIso } from '@/lib/format'
import { type Booking, BookingStatus, type Transport, TransportStatus } from '@/types'
import { useBookingRideQuery, useCancelRide } from '../transport.queries'
import { RequestRideDialog } from './request-ride-dialog'

// A ride can be requested for an active booking whose session has not passed, when it has no ride
// yet or its ride was cancelled (the backend reuses the cancelled one).
function canRequestRide(booking: Booking, ride: Transport | null) {
  const active =
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
  return (
    active &&
    booking.sessionDate >= todayIso() &&
    (ride === null || ride.status === TransportStatus.CANCELLED)
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right break-words">{children}</dd>
    </div>
  )
}

const STATUS_NOTE: Record<TransportStatus, string> = {
  REQUESTED: 'Waiting for the driver to start the trip. You can cancel until then.',
  IN_PROGRESS: 'The trip is under way. The fare is charged when the driver ends it.',
  COMPLETED: 'The trip is done and the fare was taken from your wallet.',
  CANCELLED: 'This ride was cancelled, so nothing was charged.',
}

function RideDetails({ ride }: { ride: Transport }) {
  const { tripLog } = ride
  return (
    <dl className="flex flex-col divide-y">
      <Row label="Vehicle">
        {ride.vehicle.plateNumber} · {VEHICLE_TYPE_LABEL[ride.vehicle.vehicleType]}
      </Row>
      <Row label="Driver">{ride.driver.user.name}</Row>
      <Row label="Pickup">{ride.pickupAddress}</Row>
      <Row label="Dropoff">{ride.dropoffAddress}</Row>
      <Row label="Base fare">
        <span className="tabular-nums">{formatBDT(ride.baseFare)}</span>
      </Row>
      {tripLog && (
        <Row label="Trip started">
          <time dateTime={tripLog.tripStart}>{formatActivityTime(tripLog.tripStart)}</time>
        </Row>
      )}
      {tripLog?.durationMinutes != null && (
        <Row label="Duration">
          <span className="tabular-nums">{tripLog.durationMinutes} min</span>
        </Row>
      )}
      {tripLog?.fare != null && (
        <Row label="Final fare">
          <span className="font-semibold tabular-nums">{formatBDT(tripLog.fare)}</span>
        </Row>
      )}
    </dl>
  )
}

// The ride of one booking, on the booking's page: request one, see who is driving and where it
// stands, cancel it before the trip starts. A booking has at most one ride.
export function RideSection({ booking }: { booking: Booking }) {
  const rideQuery = useBookingRideQuery(booking.id)
  const cancelRide = useCancelRide()
  const [requesting, setRequesting] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const ride = rideQuery.data ?? null
  const canRequest = rideQuery.isSuccess && canRequestRide(booking, ride)

  function renderBody() {
    if (rideQuery.isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
          <span className="sr-only">Loading the ride</span>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      )
    }
    if (rideQuery.isError) {
      return (
        <p role="alert" className="text-sm text-destructive">
          We could not load the ride for this booking.{' '}
          <button
            type="button"
            onClick={() => rideQuery.refetch()}
            className="cursor-pointer rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Try again
          </button>
        </p>
      )
    }
    if (ride) {
      return (
        <div className="flex flex-col gap-4">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge kind="transport" status={ride.status} />
            <span className="text-muted-foreground">{STATUS_NOTE[ride.status]}</span>
          </p>
          <RideDetails ride={ride} />
        </div>
      )
    }
    return (
      <p className="text-sm text-muted-foreground">
        {canRequest
          ? `No ride is requested for this session. A supervised ride starts from a flat ${formatBDT(TRANSPORT_BASE_FARE)}, plus the minutes of the trip times the driver's per-minute rate.`
          : 'No ride was requested for this session. Rides can only be requested for an upcoming booking.'}
      </p>
    )
  }

  const canCancel = ride?.status === TransportStatus.REQUESTED

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Bus aria-hidden="true" className="size-5 text-info" />
          Ride
        </CardTitle>
        <CardDescription>
          Supervised transport for {booking.child.name} on {formatSessionDate(booking.sessionDate)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {renderBody()}

        {(canRequest || canCancel) && (
          <div className="flex flex-wrap gap-2">
            {canRequest && (
              <Button
                type="button"
                className="h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90"
                onClick={() => setRequesting(true)}
              >
                <Plus aria-hidden="true" />
                {ride ? 'Request a ride again' : 'Request a ride'}
              </Button>
            )}
            {canCancel && (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4 text-destructive hover:text-destructive"
                onClick={() => setConfirmingCancel(true)}
              >
                <CalendarX2 aria-hidden="true" />
                Cancel ride
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <RequestRideDialog open={requesting} onOpenChange={setRequesting} booking={booking} />
      <ConfirmDialog
        open={confirmingCancel}
        onOpenChange={setConfirmingCancel}
        title={`Cancel the ride for ${booking.child.name}?`}
        description="The driver will not start this trip and nothing is charged. You can request a ride again until the session day."
        confirmLabel="Cancel ride"
        cancelLabel="Keep ride"
        onConfirm={() => {
          if (ride) cancelRide.mutate(ride.id)
          setConfirmingCancel(false)
        }}
      />
    </Card>
  )
}
