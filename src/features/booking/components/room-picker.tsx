'use client'

import { Check, DoorOpen, Hourglass, UserRound } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { SearchInput } from '@/components/shared/search-input'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRoomsQuery } from '@/features/room/room.queries'
import { getHourlyPrice } from '@/features/room/room-price'
import { DAY_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RoomStatus, type RoomWithSeats } from '@/types'
import { WIZARD_ROOMS_PAGE_SIZE } from '../booking.params'

const SKELETON_IDS = ['a', 'b', 'c'] as const

type RoomPickerProps = {
  // The picked room id, or '' for none.
  value: string
  error: string | undefined
  onPick: (room: RoomWithSeats) => void
}

// The list of care rooms to choose from, with a search box and paging. Search and page are local to
// the step (the wizard's own state lives in the URL as ?room=, not the list's).
export function RoomPicker({ value, error, onPick }: RoomPickerProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isPending, isError, isFetching, refetch } = useRoomsQuery({
    page,
    limit: WIZARD_ROOMS_PAGE_SIZE,
    sortBy: 'name',
    sortOrder: 'asc',
    ...(search && { q: search }),
  })

  function renderRooms() {
    if (isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-2">
          <span className="sr-only">Loading care rooms</span>
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl" />
          ))}
        </div>
      )
    }
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />

    if (!data || data.items.length === 0) {
      return (
        <EmptyState
          icon={DoorOpen}
          title={search ? 'No rooms match your search' : 'No care rooms yet'}
          description={
            search
              ? 'Try a room name or a staff member name, or clear the search.'
              : 'Rooms appear here once an admin creates them. Check back soon.'
          }
          action={
            search && (
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
              >
                Clear search
              </Button>
            )
          }
        />
      )
    }

    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Care rooms</legend>
        {data.items.map((room) => (
          <RoomOption
            key={room.id}
            room={room}
            checked={room.id === value}
            onPick={() => onPick(room)}
          />
        ))}
      </fieldset>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Care room</h3>
      <SearchInput
        value={search}
        onSearch={(text) => {
          setSearch(text)
          setPage(1)
        }}
        label="Search care rooms"
        placeholder="Search by room or staff name"
      />
      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && !isPending && 'opacity-60')}
      >
        {renderRooms()}
      </div>
      {data && data.items.length > 0 && (
        <PaginationBar meta={data.meta} onPageChange={setPage} disabled={isFetching} />
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function RoomOption({
  room,
  checked,
  onPick,
}: {
  room: RoomWithSeats
  checked: boolean
  onPick: () => void
}) {
  const hourly = getHourlyPrice(room)
  const status = room.seatsLeft > 0 ? RoomStatus.AVAILABLE : RoomStatus.FULL

  return (
    <label
      className={cn(
        'relative flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-4 pr-10 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
        checked ? 'border-cta bg-info-soft' : 'hover:bg-muted/60',
      )}
    >
      <input
        type="radio"
        name="room"
        value={room.id}
        checked={checked}
        onChange={onPick}
        className="sr-only"
      />
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-base break-words">{room.name}</span>
        <TierBadge tier={room.tier} />
      </span>
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          {DAY_LABEL[room.dayOfWeek]}s, {formatTimeRange(room.startTime, room.endTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <UserRound aria-hidden="true" className="size-4" />
          {room.staff.user.name}
        </span>
        <span>{hourly ? `${formatBDT(hourly)} per hour` : 'Price not set yet'}</span>
      </span>
      <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusBadge kind="room" status={status} />
        <span>Next session {formatSessionDate(room.sessionDate)}</span>
        {status === RoomStatus.FULL && (
          <span className="flex items-center gap-1 text-warning">
            <Hourglass aria-hidden="true" className="size-3.5" />
            Joins the waitlist
          </span>
        )}
      </span>
      {checked && <Check aria-hidden="true" className="absolute top-4 right-4 size-4 text-cta" />}
    </label>
  )
}
