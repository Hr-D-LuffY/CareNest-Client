'use client'

import { ArrowRight, CalendarClock, CalendarDays, DoorOpen, Hourglass } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { TierBadge } from '@/components/shared/tier-badge'
import { SeatMeter } from '@/features/room/components/room-seat-meter'
import { WAITLIST_COUNT_PARAMS } from '@/features/waitlist/waitlist.params'
import { useRoomWaitlistQuery } from '@/features/waitlist/waitlist.queries'
import { DAY_LABEL } from '@/lib/constants'
import { formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RoomWithSeats } from '@/types'
import { useMyRoomsQuery, useStaffProfileQuery } from '../staff.queries'
import { WaitlistsBodySkeleton } from './waitlists-skeleton'

// How many children are queued for the room, across its sessions. With someone waiting it gets the
// brand gradient; the words ("3 waiting") carry the meaning, not the colour. A failed count shows
// nothing rather than a wrong zero.
function WaitingChip({ roomId }: { roomId: string }) {
  const waiting = useRoomWaitlistQuery(roomId, WAITLIST_COUNT_PARAMS, { quiet: true })
  const count = waiting.data?.meta.total
  if (count === undefined) return <span className="text-muted-foreground">Waitlist</span>

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        count > 0
          ? 'bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),black_30%)] text-primary-foreground shadow-soft'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <Hourglass aria-hidden="true" className="size-3.5" />
      {count === 0 ? 'No one waiting' : `${count} waiting`}
    </span>
  )
}

function WaitlistRoomCard({ room }: { room: RoomWithSeats }) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border bg-linear-to-br from-info-soft via-card to-card shadow-card transition-shadow duration-200 hover:shadow-float">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-lg leading-tight break-words">
            {/* The name is the real link, stretched over the whole card, so the card is one big
                target for mouse, touch and keyboard. */}
            <Link
              href={`/staff/rooms/${room.id}/waitlist`}
              className="cursor-pointer rounded-md outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {room.name}
            </Link>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={room.tier} />
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
            <dt className="sr-only">Next session</dt>
            <CalendarDays
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <dd>
              Next session on{' '}
              <span className="font-medium">{formatSessionDate(room.sessionDate)}</span>
            </dd>
          </div>
        </dl>

        <SeatMeter room={room} showWaitlistNote={false} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-3 text-sm sm:px-5">
        <WaitingChip roomId={room.id} />
        <span aria-hidden="true" className="flex items-center gap-1 font-medium text-info">
          Open waitlist
          <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  )
}

// One card for each care room the signed-in sitter runs, each one a way into that room's waitlist. The server page has
// already prefetched the profile and the room list.
export function WaitlistsView() {
  const profile = useStaffProfileQuery()
  const rooms = useMyRoomsQuery(profile.data?.id)

  function renderRooms() {
    if (profile.isError || rooms.isError) {
      return (
        <ListErrorState
          onRetry={() => {
            if (profile.isError) profile.refetch()
            else rooms.refetch()
          }}
        />
      )
    }
    if (!rooms.data) return <WaitlistsBodySkeleton />
    if (rooms.data.length === 0) {
      return (
        <EmptyState
          icon={DoorOpen}
          title="You do not run a room yet"
          description="An admin assigns care rooms to sitters. Once one is yours, its waitlist shows up here."
        />
      )
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {rooms.data.map((room) => (
          <WaitlistRoomCard key={room.id} room={room} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Waitlists</h1>
          <p className="text-muted-foreground">
            One card for each care room you run. Open one to see the children waiting for a seat,
            ranked by priority score.
          </p>
        </header>
      </Reveal>
      {renderRooms()}
    </div>
  )
}
