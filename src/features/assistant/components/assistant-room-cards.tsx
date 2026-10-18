import { Armchair, CalendarClock, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { TierBadge } from '@/components/shared/tier-badge'
import { buttonVariants } from '@/components/ui/button'
import { DAY_LABEL } from '@/lib/constants'
import { formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AssistantRoom, ChatLink } from '@/types'
import { findBookingLink, findOtherLinks, roomPagePath } from '../assistant-links'

type AssistantRoomCardsProps = {
  rooms: readonly AssistantRoom[]
  links: readonly ChatLink[]
  // Called when a link is followed, so the panel can close and show the page.
  onNavigate: () => void
}

const BOOK_LINK_CLASS = cn(
  buttonVariants({ size: 'lg' }),
  'h-10 rounded-full border-2 border-play-ink bg-play-sun px-5 font-bold text-play-ink hover:bg-play-sun/80',
)
const VIEW_LINK_CLASS = cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'h-10 rounded-full')

function Seats({ seatsLeft }: { seatsLeft: number }) {
  if (seatsLeft <= 0) {
    return <span className="font-medium text-warning">Full: you can join the waitlist</span>
  }
  return (
    <span className="font-medium text-success">
      {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left
    </span>
  )
}

function RoomCard({
  room,
  link,
  onNavigate,
}: {
  room: AssistantRoom
  link: ChatLink | null
  onNavigate: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border bg-card p-3.5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base leading-tight break-words">{room.name}</h3>
        <TierBadge tier={room.tier} className="shrink-0" />
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
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
        <div className="flex items-start gap-2">
          <dt className="sr-only">Seats</dt>
          <Armchair aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <dd>
            <Seats seatsLeft={room.seatsLeft} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        {link && (
          <Link href={link.href} onClick={onNavigate} className={BOOK_LINK_CLASS}>
            Book this seat
            <span className="sr-only"> for {room.name}</span>
          </Link>
        )}
        <Link href={roomPagePath(room)} onClick={onNavigate} className={VIEW_LINK_CLASS}>
          View room
          <span className="sr-only">: {room.name}</span>
        </Link>
      </div>
    </article>
  )
}

// The rooms the assistant found for a reply, as cards with a booking shortcut each. The rooms and
// links both come from the backend, built from its own search, so nothing here depends on what the
// model wrote.
export function AssistantRoomCards({ rooms, links, onNavigate }: AssistantRoomCardsProps) {
  const otherLinks = findOtherLinks(links, rooms)

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label="Rooms the assistant found" className="flex flex-col gap-2">
        {rooms.map((room) => (
          <li key={`${room.id}-${room.sessionDate}`}>
            <RoomCard room={room} link={findBookingLink(links, room)} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
      {otherLinks.map((link) => (
        <Link key={link.href} href={link.href} onClick={onNavigate} className={BOOK_LINK_CLASS}>
          {link.label}
        </Link>
      ))}
    </div>
  )
}
