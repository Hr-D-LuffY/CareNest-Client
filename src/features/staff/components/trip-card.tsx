'use client'

import {
  CalendarClock,
  CircleAlert,
  CircleDot,
  Clock,
  Flag,
  Loader2,
  MapPin,
  Navigation,
  Play,
} from 'lucide-react'
import { ActionDialog } from '@/components/shared/action-dialog'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatActivityTime, formatBDT, formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types'
import { getDateLabel } from '../task-model'
import { formatOnTheWay, getTripPhase, type TripPhase } from '../trip-model'

// Everything a trip card needs to show its state and offer the right action. The page builds it
// once and every card gets the same object.
export type TripActions = {
  // "YYYY-MM-DD", the backend's "today".
  today: string
  // null until mounted (see useNow).
  now: number | null
  // False until an admin has verified the staff account.
  canAct: boolean
  // Trips with a start or end request still running.
  busyIds: ReadonlySet<string>
  onStart: (trip: Trip) => void
  // Opens the confirmation: ending a trip charges the guardian's wallet.
  onEnd: (trip: Trip) => void
}

const PHASE_BADGE: Record<TripPhase, { tone: string; icon: typeof Clock; label: string }> = {
  'on-the-way': { tone: 'bg-success-soft text-success', icon: Navigation, label: 'On the way' },
  ready: { tone: 'bg-info-soft text-info', icon: Clock, label: 'Today' },
  upcoming: { tone: 'bg-muted text-muted-foreground', icon: CalendarClock, label: 'Upcoming' },
  missed: { tone: 'bg-warning-soft text-warning', icon: CircleAlert, label: 'Missed' },
}

// A pill with the trip's state. For a trip on the way it counts the minutes since it started.
function TripPhaseBadge({ trip, actions }: { trip: Trip; actions: TripActions }) {
  const phase = getTripPhase(trip, actions.today)
  const { tone, icon: Icon, label } = PHASE_BADGE[phase]
  const text =
    phase === 'on-the-way' && trip.tripLog
      ? formatOnTheWay(trip.tripLog.tripStart, actions.now)
      : label

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tone,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {text}
    </span>
  )
}

// Where the child is picked up and dropped off, drawn as a short route.
export function TripRoute({ pickup, dropoff }: { pickup: string; dropoff: string }) {
  return (
    <ol className="flex flex-col gap-0 text-sm">
      <li className="flex gap-3">
        <span className="flex flex-col items-center">
          <CircleDot aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span aria-hidden="true" className="my-1 w-px flex-1 bg-border" />
        </span>
        <span className="min-w-0 pb-3">
          <span className="block text-xs text-muted-foreground">Pickup</span>
          <span className="break-words">{pickup}</span>
        </span>
      </li>
      <li className="flex gap-3">
        <MapPin aria-hidden="true" className="size-4 shrink-0 text-destructive" />
        <span className="min-w-0">
          <span className="block text-xs text-muted-foreground">Dropoff</span>
          <span className="break-words">{dropoff}</span>
        </span>
      </li>
    </ol>
  )
}

// The one action a trip offers right now: "Start trip" on the session day, "End trip" once it is on
// the way. A trip on another day has no button, only a line that says why.
function TripActionButton({ trip, actions }: { trip: Trip; actions: TripActions }) {
  const phase = getTripPhase(trip, actions.today)

  if (phase === 'upcoming' || phase === 'missed') {
    const Icon = phase === 'upcoming' ? CalendarClock : CircleAlert
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {phase === 'upcoming'
          ? `A trip can start on ${getDateLabel(trip.booking.sessionDate, actions.today)}`
          : 'Session day passed, this trip can no longer start'}
      </p>
    )
  }

  const starting = phase === 'ready'
  const busy = actions.busyIds.has(trip.id)
  const Icon = starting ? Play : Flag

  return (
    <Button
      type="button"
      disabled={busy || !actions.canAct}
      title={actions.canAct ? undefined : 'Available once an admin verifies your account'}
      className="h-11 w-full gap-2 bg-cta px-4 font-semibold text-cta-foreground hover:bg-cta/90"
      onClick={() => (starting ? actions.onStart(trip) : actions.onEnd(trip))}
    >
      {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Icon aria-hidden="true" />}
      {busy ? 'Saving…' : starting ? 'Start trip' : 'End trip'}
      <span className="sr-only"> for {trip.booking.child.name}</span>
    </Button>
  )
}

// One ride as a card: who, the route, the vehicle, and the action that fits.
export function TripCard({ trip, actions }: { trip: Trip; actions: TripActions }) {
  const phase = getTripPhase(trip, actions.today)
  const onTheWay = phase === 'on-the-way'

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-soft motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2',
        onTheWay && 'border-success/40 bg-linear-to-br from-success-soft via-card to-card',
      )}
    >
      <header className="flex items-start gap-3">
        <UserAvatar name={trip.booking.child.name} photo={null} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-heading text-base break-words">{trip.booking.child.name}</h3>
          <p className="text-xs text-muted-foreground">
            {formatSessionDate(trip.booking.sessionDate)}
          </p>
        </div>
        <TripPhaseBadge trip={trip} actions={actions} />
      </header>

      <TripRoute pickup={trip.pickupAddress} dropoff={trip.dropoffAddress} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          {trip.vehicle.plateNumber} · {VEHICLE_TYPE_LABEL[trip.vehicle.vehicleType]}
        </span>
        <span>
          Base fare <span className="tabular-nums">{formatBDT(trip.baseFare)}</span>
        </span>
        {onTheWay && trip.tripLog && (
          <span>Started {formatActivityTime(trip.tripLog.tripStart)}</span>
        )}
      </p>

      <TripActionButton trip={trip} actions={actions} />
    </article>
  )
}

type EndTripDialogProps = {
  trip: Trip | null
  // The driver's per-minute rate, when known.
  perMinuteRate: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: (trip: Trip) => void
}

// Ending a trip prices it and charges the guardian's wallet, which cannot be undone, so it asks
// first. Starting has no dialog: it can simply be followed by ending the trip.
export function EndTripDialog({
  trip,
  perMinuteRate,
  onOpenChange,
  onConfirm,
}: EndTripDialogProps) {
  const tripStart = trip?.tripLog?.tripStart
  return (
    <ActionDialog
      open={trip !== null}
      onOpenChange={onOpenChange}
      icon={Flag}
      title={trip ? `End the trip for ${trip.booking.child.name}?` : 'End this trip?'}
      description={
        <>
          {tripStart && `Started ${formatActivityTime(tripStart)}. `}
          This charges the guardian&apos;s wallet the base fare
          {trip && ` (${formatBDT(trip.baseFare)})`} plus every minute of the trip, rounded up
          {perMinuteRate !== null && `, at ${formatBDT(perMinuteRate)} a minute`}. If their wallet
          is short, nothing is charged.
        </>
      }
      confirmLabel="End trip"
      cancelLabel="Not yet"
      onConfirm={() => {
        if (trip) onConfirm(trip)
      }}
    />
  )
}
