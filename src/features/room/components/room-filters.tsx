'use client'

import { FilterX } from 'lucide-react'
import { useId } from 'react'
import { FilterSelect } from '@/components/shared/filter-select'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryParams } from '@/hooks/use-query-params'
import { DAY_LABEL, TIER_LABEL } from '@/lib/constants'
import { todayIso } from '@/lib/format'
import { DAYS_OF_WEEK, type DayOfWeek, RoomStatus, Tier } from '@/types'
import {
  hasRoomFilters,
  ROOM_FILTER_KEYS,
  ROOM_SORTS,
  type RoomSort,
  type RoomViewParams,
  weekdayOf,
} from '../room.params'

const TIER_FILTERS = [
  { value: undefined, label: 'All' },
  { value: Tier.DAILY, label: TIER_LABEL.DAILY },
  { value: Tier.WEEKLY, label: TIER_LABEL.WEEKLY },
  { value: Tier.MONTHLY, label: TIER_LABEL.MONTHLY },
] as const

const STATUS_OPTIONS = [
  { value: '', label: 'Any availability' },
  { value: RoomStatus.AVAILABLE, label: 'Seats available' },
  { value: RoomStatus.FULL, label: 'Full (waitlist)' },
] as const

const DAY_OPTIONS = [
  { value: '', label: 'Any day' },
  ...DAYS_OF_WEEK.map((day) => ({ value: day, label: DAY_LABEL[day] })),
] as const

const SORT_OPTIONS = ROOM_SORTS.map(({ value, label }) => ({ value, label }))

// Search, tier, availability, day, session date and sort for the room list. Every control writes to
// the URL (through useQueryParams), and the list reads it back, so a refresh or a shared link
// shows the same rooms.
export function RoomFilters({ params, total }: { params: RoomViewParams; total?: number }) {
  const query = useQueryParams()
  const dateId = useId()
  const filtered = hasRoomFilters(params)

  return (
    <section
      aria-label="Find a care room"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
    >
      <SearchInput
        value={params.q ?? ''}
        onSearch={(text) => query.set({ q: text })}
        label="Search care rooms"
        placeholder="Search by room name or staff name"
      />

      <fieldset className="flex min-w-0 flex-wrap gap-2">
        <legend className="sr-only">Filter by care tier</legend>
        {TIER_FILTERS.map(({ value, label }) => {
          const active = params.tier === value
          return (
            <Button
              key={label}
              type="button"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              className="h-10 px-4"
              onClick={() => query.set({ tier: value })}
            >
              {label}
            </Button>
          )
        })}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Availability"
          value={params.status ?? ''}
          options={STATUS_OPTIONS}
          onChange={(status) => query.set({ status })}
        />
        <FilterSelect
          label="Day of the week"
          value={params.date ? weekdayOf(params.date) : (params.day ?? '')}
          options={DAY_OPTIONS}
          onChange={(day: DayOfWeek | '') => query.set({ day })}
          disabled={Boolean(params.date)}
          hint={params.date ? 'Set by the session date' : undefined}
        />
        <label htmlFor={dateId} className="flex min-w-0 flex-col gap-1.5 text-sm">
          <span className="font-medium text-muted-foreground">Session date</span>
          <Input
            id={dateId}
            type="date"
            value={params.date ?? ''}
            min={todayIso()}
            // A date fixes the weekday, so the day filter is cleared with it.
            onChange={(event) => query.set({ date: event.target.value, day: undefined })}
            className="h-10 rounded-lg"
          />
          <span className="text-xs text-muted-foreground">
            {params.date ? 'Seats are counted for this day' : "Empty: each room's next session"}
          </span>
        </label>
        <FilterSelect
          label="Sort by"
          value={params.sort}
          options={SORT_OPTIONS}
          onChange={(sort: RoomSort) => query.set({ sort: sort === 'newest' ? undefined : sort })}
        />
      </div>

      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
        {total === undefined ? (
          <span />
        ) : (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
            {total === 1 ? 'room' : 'rooms'}
            {filtered && ' match your filters'}
          </p>
        )}
        {filtered && (
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-3"
            onClick={() => query.clear(...ROOM_FILTER_KEYS)}
          >
            <FilterX aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </section>
  )
}
