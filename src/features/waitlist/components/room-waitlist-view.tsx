'use client'

import { ArrowLeft, CalendarClock, Hourglass, RotateCw, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { TierBadge } from '@/components/shared/tier-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { upcomingSessions } from '@/features/room/room.params'
import { useRoomQuery } from '@/features/room/room.queries'
import { useNow } from '@/hooks/use-now'
import { useQueryParams } from '@/hooks/use-query-params'
import { DAY_LABEL } from '@/lib/constants'
import { formatSessionDate, formatTimeRange } from '@/lib/format'
import { BRAND_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'
import { parseRoomWaitlistView, toRoomWaitlistParams } from '../waitlist.params'
import { useRoomWaitlistQuery } from '../waitlist.queries'
import { RoomWaitlistTable } from './room-waitlist-table'
import { ScoreFormula } from './score-formula'

type RoomWaitlistViewProps = {
  roomId: string
  // Where the "back" link goes: the staff member's rooms, or (for an admin) the room list.
  backHref: string
  backLabel: string
}

// A room's pending queue, ranked by priority score. The URL (?date=&page=) is the single source of
// truth, so a refresh or a shared link shows the same session and page. The server page has already
// prefetched the first load, and the queue asks again every 30 seconds, so a cancellation that
// promotes the next child shows up here by itself.
export function RoomWaitlistView({ roomId, backHref, backLabel }: RoomWaitlistViewProps) {
  const query = useQueryParams()
  const now = useNow()
  const view = parseRoomWaitlistView({ page: query.get('page'), date: query.get('date') })
  const room = useRoomQuery(roomId, undefined)
  // The seats of the picked session (the room's next one until it has loaded or when none is picked).
  const picked = useRoomQuery(roomId, view.date, Boolean(view.date))
  const seatsRoom = picked.data ?? room.data
  const list = useRoomWaitlistQuery(roomId, toRoomWaitlistParams(view), { live: true })

  const meta = list.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // A promotion can empty the last page (or a hand-edited ?page=9 points past the end). Step back to
  // the last page that has rows.
  useEffect(() => {
    if (meta && total > 0 && view.page > lastPage) query.setPage(lastPage)
  }, [meta, total, view.page, lastPage, query])

  const sessions = room.data ? upcomingSessions(room.data.sessionDate, view.date) : []
  const roomName = room.data?.name ?? 'this room'

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Session</legend>
          <Button
            type="button"
            variant={view.date ? 'outline' : 'default'}
            aria-pressed={!view.date}
            className="h-10 px-4"
            onClick={() => query.set({ date: undefined })}
          >
            All sessions
          </Button>
          {sessions.map((date) => {
            const selected = view.date === date
            return (
              <Button
                key={date}
                type="button"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="h-10 px-4"
                onClick={() => query.set({ date })}
              >
                {formatSessionDate(date)}
              </Button>
            )
          })}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <ScoreFormula />
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 px-3"
            disabled={list.isFetching}
            onClick={() => list.refetch()}
          >
            <RotateCw
              aria-hidden="true"
              className={cn('size-4', list.isFetching && 'motion-safe:animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      <p className="-mt-3 text-sm text-muted-foreground">
        {view.date
          ? 'Ranked by priority score. The first child is promoted when a seat opens.'
          : 'Every session, best score first. Pick a session to see who is promoted next.'}{' '}
        This list updates by itself every 30 seconds.
      </p>

      <RoomWaitlistTable
        data={list.data}
        roomName={roomName}
        singleSession={Boolean(view.date)}
        now={now}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={query.setPage}
        empty={
          <EmptyState
            icon={Hourglass}
            title={view.date ? 'Nobody is waiting for this session' : 'Nobody is waiting'}
            description="When a session is full, the children who could not get a seat queue here, best priority score first. A cancelled seat goes to the first one in line."
          />
        }
      />
    </div>
  )
}
