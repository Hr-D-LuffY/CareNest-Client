import { ArrowRight, CalendarClock, CalendarDays, Hourglass, Users } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { DAY_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatMultiplier, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RoomStatus, type RoomWithSeats } from '@/types'

// The bar turns amber when a quarter of the seats or fewer are left, and red when the room is full.
const LOW_SEATS_SHARE = 0.25

function getSeatTone(room: RoomWithSeats) {
  if (room.seatsLeft === 0) return 'bg-destructive'
  return room.seatsLeft <= room.capacity * LOW_SEATS_SHARE ? 'bg-warning' : 'bg-success'
}

function SeatMeter({ room }: { room: RoomWithSeats }) {
  const full = room.seatsLeft === 0
  const share = room.capacity > 0 ? Math.min(100, (room.bookedSeats / room.capacity) * 100) : 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <Users aria-hidden="true" className="size-4 text-muted-foreground" />
          {full ? 'No seats left' : `${room.seatsLeft} of ${room.capacity} seats left`}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {room.bookedSeats}/{room.capacity} booked
        </span>
      </div>
      {/* Decorative: the seats left are already stated in words above. */}
      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', getSeatTone(room))}
          style={{ width: `${share}%` }}
        />
      </div>
      {full && (
        <p className="flex items-start gap-1.5 text-sm text-warning">
          <Hourglass aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Booking this session puts your child on the waitlist.
        </p>
      )}
    </div>
  )
}

function RoomCard({ room }: { room: RoomWithSeats }) {
  const status = room.seatsLeft > 0 ? RoomStatus.AVAILABLE : RoomStatus.FULL

  return (
    <article className="relative flex h-full flex-col rounded-2xl border bg-linear-to-br from-info-soft via-card to-card shadow-card transition-shadow duration-200 hover:shadow-float">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-lg leading-tight break-words">
            {/* The name is the real link, stretched over the whole card, so the card is one big
                target for mouse, touch and keyboard. */}
            <Link
              href={`/dashboard/rooms/${room.id}`}
              className="cursor-pointer rounded-md outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {room.name}
            </Link>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={room.tier} />
            <StatusBadge kind="room" status={status} />
          </div>
        </div>

        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Schedule</dt>
            <CalendarClock
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <dd>
              {DAY_LABEL[room.dayOfWeek]}s, {formatTimeRange(room.startTime, room.endTime)}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Session date</dt>
            <CalendarDays
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <dd>
              Session on <span className="font-medium">{formatSessionDate(room.sessionDate)}</span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Run by</dt>
            <UserAvatar name={room.staff.user.name} photo={null} size={28} />
            <dd className="min-w-0">
              <span className="font-medium">{room.staff.user.name}</span>
              <span className="text-muted-foreground">
                {' '}
                · {STAFF_TYPE_LABEL[room.staff.staffType]}
              </span>
            </dd>
          </div>
        </dl>

        <SeatMeter room={room} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-3 text-sm sm:px-5">
        <span className="text-muted-foreground">
          Rate{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {formatMultiplier(room.priceMultiplier)}
          </span>
        </span>
        <span aria-hidden="true" className="flex items-center gap-1 font-medium text-info">
          View room
          <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  )
}

// Cards in a grid. No entrance animation: the list changes with every filter, sort and page (a
// card that mounts after the page loaded would stay hidden), and data lists should not animate.
export function RoomCards({ items }: { items: readonly RoomWithSeats[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
