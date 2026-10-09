import { CalendarPlus, Hourglass } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { DAY_LABEL } from '@/lib/constants'
import {
  formatSessionDate,
  formatTimeRange,
  formatWeekday,
  getSessionDateParts,
} from '@/lib/format'
import { BRAND_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'
import type { RoomWithSeats } from '@/types'
import { SeatMeter } from './room-seat-meter'

type RoomSessionsProps = {
  // The room with its seats for the picked session.
  room: RoomWithSeats
  // The session dates on offer, soonest first. The first one is the room's next session.
  sessions: readonly string[]
  // The picked session, "YYYY-MM-DD".
  selected: string
}

// Pick a session date (each one is a link, so the pick lives in the URL and can be shared), see the
// seats for it, and go on to book. A full session says plainly that booking joins the waitlist.
export function RoomSessions({ room, sessions, selected }: RoomSessionsProps) {
  const full = room.seatsLeft === 0
  const [nextSession] = sessions

  return (
    <section
      aria-labelledby="sessions-heading"
      className={cn(BRAND_SURFACE, 'flex flex-col gap-5 rounded-2xl p-4 sm:p-5')}
    >
      <div className="flex flex-col gap-1">
        <h2 id="sessions-heading" className="text-xl">
          Pick a session
        </h2>
        <p className="text-sm text-primary-foreground/80">
          Runs every {DAY_LABEL[room.dayOfWeek]}, {formatTimeRange(room.startTime, room.endTime)}.
          Seats are counted for each date.
        </p>
      </div>

      <nav aria-label="Upcoming sessions">
        <ul className="flex flex-wrap gap-2">
          {sessions.map((date) => {
            const active = date === selected
            const { day, month } = getSessionDateParts(date)
            return (
              <li key={date}>
                <Link
                  // The next session is the default, so it needs no ?date= in the URL.
                  href={
                    date === nextSession
                      ? `/dashboard/rooms/${room.id}`
                      : `/dashboard/rooms/${room.id}?date=${date}`
                  }
                  scroll={false}
                  aria-current={active ? 'date' : undefined}
                  className={cn(
                    'flex min-h-20 w-18 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/60',
                    active
                      ? 'border-primary-foreground bg-primary-foreground text-primary'
                      : 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20',
                  )}
                >
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-80">
                    {formatWeekday(date)}
                  </span>
                  <span className="font-heading text-2xl leading-none tabular-nums">{day}</span>
                  <span className="text-xs opacity-80">{month}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <SeatMeter room={room} onBrand />

      <div className="flex flex-col gap-2 border-t border-primary-foreground/25 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary-foreground/80">
          {full
            ? `You will be ranked on the waitlist for ${formatSessionDate(selected)}, and promoted automatically if a seat opens.`
            : `Book a seat for ${formatSessionDate(selected)}.`}
        </p>
        <Link
          href={`/dashboard/book?room=${room.id}&date=${selected}`}
          className={cn(
            buttonVariants(),
            'h-11 shrink-0 bg-primary-foreground px-5 font-semibold text-primary hover:bg-primary-foreground/90 focus-visible:ring-primary-foreground/60',
          )}
        >
          {full ? <Hourglass aria-hidden="true" /> : <CalendarPlus aria-hidden="true" />}
          {full ? 'Join the waitlist' : 'Book a seat'}
        </Link>
      </div>
    </section>
  )
}
