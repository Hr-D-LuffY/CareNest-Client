'use client'

import { Hourglass, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { upcomingSessions } from '@/features/room/room.params'
import { useRoomQuery } from '@/features/room/room.queries'
import { useNow } from '@/hooks/use-now'
import { useQueryParams } from '@/hooks/use-query-params'
import { formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { parseRoomWaitlistView, toRoomWaitlistParams } from '../waitlist.params'
import { useRoomWaitlistQuery } from '../waitlist.queries'
import { RoomWaitlistTable } from './room-waitlist-table'
import { ScoreFormula } from './score-formula'

// A room's pending queue, ranked by priority score: the session picker, the table and its notes. The
// staff waitlist page and the admin's room page both show it. The URL (?date=&page=) is the single
// source of truth, so a refresh or a shared link shows the same session and page. The server page has
// already prefetched the first load, and the queue asks again every 30 seconds, so a cancellation
// that promotes the next child shows up here by itself.
export function RoomWaitlistPanel({ roomId }: { roomId: string }) {
  const query = useQueryParams()
  const now = useNow()
  const view = parseRoomWaitlistView({ page: query.get('page'), date: query.get('date') })
  const room = useRoomQuery(roomId, undefined)
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
