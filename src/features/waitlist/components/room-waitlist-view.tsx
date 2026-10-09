'use client'

import { ArrowLeft, CalendarClock, Hourglass, Users } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { TierBadge } from '@/components/shared/tier-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRoomQuery } from '@/features/room/room.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import { DAY_LABEL } from '@/lib/constants'
import { formatSessionDate, formatTimeRange } from '@/lib/format'
import { BRAND_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'
import { parseRoomWaitlistView, toRoomWaitlistParams } from '../waitlist.params'
import { useRoomWaitlistQuery } from '../waitlist.queries'
import { RoomWaitlistPanel } from './room-waitlist-panel'

type RoomWaitlistViewProps = {
  roomId: string
  // Where the "back" link goes: the staff member's rooms, or (for an admin) the room list.
  backHref: string
  backLabel: string
}

// The staff waitlist page: a header with the room, its seats and how many children are waiting, then
// the ranked queue itself (RoomWaitlistPanel).
export function RoomWaitlistView({ roomId, backHref, backLabel }: RoomWaitlistViewProps) {
  const query = useQueryParams()
  const view = parseRoomWaitlistView({ page: query.get('page'), date: query.get('date') })
  const room = useRoomQuery(roomId, undefined)
  // The seats of the picked session (the room's next one until it has loaded or when none is picked).
  const picked = useRoomQuery(roomId, view.date, Boolean(view.date))
  const seatsRoom = picked.data ?? room.data
  const list = useRoomWaitlistQuery(roomId, toRoomWaitlistParams(view), { live: true })

  const total = list.data?.meta.total ?? 0

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className={cn(BRAND_SURFACE, 'flex flex-col gap-5 rounded-2xl p-5 sm:p-6')}>
          <Link
            href={backHref}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md text-sm text-primary-foreground/80 outline-none hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-primary-foreground/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {backLabel}
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-sm font-semibold tracking-wide text-primary-foreground/80 uppercase">
                Waitlist
              </p>
              {room.data ? (
                <h1 className="text-2xl break-words text-balance md:text-3xl">{room.data.name}</h1>
              ) : (
                <Skeleton className="h-9 w-56 bg-primary-foreground/25" />
              )}
              {room.data && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-primary-foreground/80">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock aria-hidden="true" className="size-4" />
                    {DAY_LABEL[room.data.dayOfWeek]}s,{' '}
                    {formatTimeRange(room.data.startTime, room.data.endTime)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users aria-hidden="true" className="size-4" />
                    {(seatsRoom ?? room.data).seatsLeft} of {room.data.capacity}{' '}
                    {room.data.capacity === 1 ? 'seat' : 'seats'} left on{' '}
                    {formatSessionDate((seatsRoom ?? room.data).sessionDate)}
                  </span>
                  <TierBadge tier={room.data.tier} className="bg-background text-foreground" />
                </p>
              )}
            </div>

            <p
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl bg-primary-foreground/15 px-4 py-3"
            >
              <Hourglass aria-hidden="true" className="size-6" />
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-3xl tabular-nums">
                  {list.data ? total : '–'}
                </span>
                <span className="text-sm text-primary-foreground/80">
                  {total === 1 ? 'child waiting' : 'children waiting'}
                </span>
              </span>
            </p>
          </div>
        </header>
      </Reveal>

      <h2 className="sr-only">The queue</h2>
      <RoomWaitlistPanel roomId={roomId} />
    </div>
  )
}
