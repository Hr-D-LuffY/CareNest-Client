'use client'

import { Check } from 'lucide-react'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { SeatMeter } from '@/features/room/components/room-seat-meter'
import { DAY_LABEL } from '@/lib/constants'
import {
  formatSessionDate,
  formatTimeRange,
  formatWeekday,
  getSessionDateParts,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SelectedRoom } from '../use-selected-room'

const SKELETON_IDS = ['a', 'b', 'c', 'd'] as const

type SessionPickerProps = {
  selected: SelectedRoom
  // The picked session date, "YYYY-MM-DD", or '' for none.
  value: string
  error: string | undefined
  onPick: (date: string) => void
}

// The picked room's next session dates as a row of date tiles, and the seats left on the one picked.
// Only dates on the room's weekday are offered, so the backend's "This room runs on …" error cannot
// happen from here. A full session says plainly that booking joins the waitlist.
export function SessionPicker({ selected, value, error, onPick }: SessionPickerProps) {
  const { room, sessions, isPending, isError, refetch } = selected

  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
        <span className="sr-only">Loading sessions</span>
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-20 w-18 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }
  if (isError) return <ListErrorState onRetry={refetch} />
  if (!room) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium">Session date</h3>
        <p className="text-sm text-muted-foreground">
          {room.name} runs every {DAY_LABEL[room.dayOfWeek]},{' '}
          {formatTimeRange(room.startTime, room.endTime)}. Seats are counted for each date.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Session date</legend>
        <ul className="flex flex-wrap gap-2">
          {sessions.map((date) => {
            const checked = date === value
            const { day, month } = getSessionDateParts(date)
            return (
              <li key={date}>
                <label
                  className={cn(
                    'relative flex min-h-20 w-18 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                    checked ? 'border-cta bg-info-soft' : 'bg-card hover:bg-muted/60',
                  )}
                >
                  <input
                    type="radio"
                    name="sessionDate"
                    value={date}
                    checked={checked}
                    onChange={() => onPick(date)}
                    aria-label={formatSessionDate(date)}
                    className="sr-only"
                  />
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {formatWeekday(date)}
                  </span>
                  <span className="font-heading text-2xl leading-none tabular-nums">{day}</span>
                  <span className="text-xs text-muted-foreground">{month}</span>
                  {checked && (
                    <Check
                      aria-hidden="true"
                      className="absolute top-1 right-1 size-3.5 text-cta"
                    />
                  )}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {value !== '' && <SeatMeter room={room} />}
    </div>
  )
}
