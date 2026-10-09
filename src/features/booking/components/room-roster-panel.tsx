'use client'

import { RotateCw, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BookingStatus, RoomWithSeats } from '@/types'
import { useRoomBookingsQuery } from '../booking.queries'
import {
  parseRoomRosterView,
  ROSTER_DATE_KEY,
  ROSTER_PAGE_KEY,
  ROSTER_STATUS_KEY,
  ROSTER_STATUSES,
  rosterSessions,
  toRoomRosterParams,
} from '../room-roster.params'
import { RoomRosterTable } from './room-roster-table'

const STATUS_LABEL: Record<(typeof ROSTER_STATUSES)[number], string> = {
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Who is booked into one session of a room, and who booked them: the session picker, a status filter
// and the table. The URL (?rdate=&rstatus=&rpage=) is the source of truth, so a refresh or a shared
// link shows the same session and page; the keys are prefixed because the waitlist beside it owns
// ?date= and ?page=. The list asks again every 30 seconds, so a cancellation or a check-in shows up
// by itself.
export function RoomRosterPanel({ room }: { room: RoomWithSeats }) {
  const query = useQueryParams()
  const view = parseRoomRosterView(
    {
      page: query.get(ROSTER_PAGE_KEY),
      date: query.get(ROSTER_DATE_KEY),
      status: query.get(ROSTER_STATUS_KEY),
    },
    room,
  )
  const list = useRoomBookingsQuery(room.id, toRoomRosterParams(view))

  const meta = list.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // Changes the session or the filter and goes back to page 1, leaving the waitlist's own ?date= and
  // ?page= as they are (set() would drop ?page= otherwise).
  function update(updates: { [ROSTER_DATE_KEY]?: string; [ROSTER_STATUS_KEY]?: BookingStatus }) {
    query.set({ page: query.get('page'), [ROSTER_PAGE_KEY]: undefined, ...updates })
  }

  function changePage(page: number) {
    query.set({ page: query.get('page'), [ROSTER_PAGE_KEY]: page > 1 ? page : undefined })
  }

  // A cancellation can empty the last page (or a hand-edited ?rpage=9 points past the end). Step back
  // to the last page that has rows.
  useEffect(() => {
    if (meta && total > 0 && view.page > lastPage) {
      query.set({ page: query.get('page'), [ROSTER_PAGE_KEY]: lastPage > 1 ? lastPage : undefined })
    }
  }, [meta, total, view.page, lastPage, query])

  const sessions = rosterSessions(room.sessionDate, view.date)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Session</legend>
          {sessions.map((date) => {
            const selected = view.date === date
            return (
              <Button
                key={date}
                type="button"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="h-10 px-4"
                onClick={() =>
                  update({ [ROSTER_DATE_KEY]: date === room.sessionDate ? undefined : date })
                }
              >
                {formatSessionDate(date)}
                {date === room.sessionDate && <span className="sr-only"> (next session)</span>}
              </Button>
            )
          })}
        </fieldset>

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

      <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
        <legend className="sr-only">Booking status</legend>
        <Button
          type="button"
          variant={view.status ? 'outline' : 'secondary'}
          aria-pressed={!view.status}
          className="h-9 px-3"
          onClick={() => update({ [ROSTER_STATUS_KEY]: undefined })}
        >
          All
        </Button>
        {ROSTER_STATUSES.map((status) => (
          <Button
            key={status}
            type="button"
            variant={view.status === status ? 'secondary' : 'outline'}
            aria-pressed={view.status === status}
            className="h-9 px-3"
            onClick={() => update({ [ROSTER_STATUS_KEY]: status })}
          >
            {STATUS_LABEL[status]}
          </Button>
        ))}
        <p aria-live="polite" className="ml-1 text-sm text-muted-foreground">
          {list.data
            ? `${total} ${total === 1 ? 'booking' : 'bookings'} on ${formatSessionDate(view.date)}`
            : 'Loading…'}
        </p>
      </fieldset>

      <RoomRosterTable
        data={list.data}
        roomName={room.name}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={changePage}
        empty={
          <EmptyState
            icon={UsersRound}
            title={
              view.status ? 'No bookings with this status' : 'Nobody is booked for this session'
            }
            description="Children who book a seat appear here with the guardian who booked them, and whether they have arrived."
          />
        }
      />
    </div>
  )
}
