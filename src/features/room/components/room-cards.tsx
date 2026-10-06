import { ArrowRight, CalendarClock, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { DAY_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate, formatTimeRange } from '@/lib/format'
import { RoomStatus, type RoomWithSeats } from '@/types'
import { getHourlyPrice } from '../room-price'
import { SeatMeter } from './room-seat-meter'

// The price for one hour: the sitter's rate × the room multiplier.
function HourlyPrice({ room }: { room: RoomWithSeats }) {
  const hourly = getHourlyPrice(room)

  if (hourly) {
    return (
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{formatBDT(hourly)}</span> per
        hour
      </span>
    )
  }
  return <span className="text-muted-foreground">Price not set yet</span>
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
        <HourlyPrice room={room} />
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
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
