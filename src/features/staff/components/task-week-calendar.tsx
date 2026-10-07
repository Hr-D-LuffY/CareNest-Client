'use client'

import { CalendarClock, CircleAlert, Users } from 'lucide-react'
import { formatSessionDate, formatWeekday, getSessionDateParts } from '@/lib/format'
import { cn } from '@/lib/utils'
import { LATER_DATES, MISSED_DATES } from '../task.params'
import type { TaskDay } from '../task-model'

type TaskWeekCalendarProps = {
  // Today and the 13 days after it.
  days: readonly TaskDay[]
  // A "YYYY-MM-DD", or "later" / "missed".
  selected: string
  today: string
  laterCount: number
  missedCount: number
  onSelect: (value: string) => void
}

function plural(count: number) {
  return `${count} ${count === 1 ? 'child' : 'children'}`
}

// A tile's look says what kind of day it is. The words inside say it too, so colour is never the
// only signal.
//   booked         children are booked: the deep gradient
//   available      the sitter works that weekday, nobody booked yet: the light gradient
//   unavailable    not one of their days: plain
//   unknown        availability could not be read: plain, and no claim either way
function tileLook(day: TaskDay, selected: boolean) {
  if (selected) {
    return 'border-transparent bg-linear-to-br from-primary to-primary/75 text-primary-foreground shadow-card'
  }
  if (day.count > 0) {
    return 'border-primary/40 bg-linear-to-br from-primary/35 via-primary/15 to-info-soft hover:border-primary/60'
  }
  if (day.available) {
    return 'border-primary/15 bg-linear-to-br from-primary/10 via-card to-card hover:border-primary/40'
  }
  return 'bg-card text-muted-foreground hover:bg-muted'
}

function tileNote(day: TaskDay) {
  if (day.count > 0) {
    return (
      <>
        <Users className="size-3.5" />
        {day.count}
      </>
    )
  }
  if (day.available === null) return '–'
  return day.available ? 'Free' : 'Off'
}

function tileLabel(day: TaskDay, today: string) {
  const when = `${day.date === today ? 'Today, ' : ''}${formatSessionDate(day.date)}`
  if (day.count > 0) return `${when}: ${plural(day.count)} booked`
  if (day.available === null) return `${when}: nobody booked`
  return day.available
    ? `${when}: an available day, nobody booked yet`
    : `${when}: not one of your available days`
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('size-3 rounded-sm border', className)} />
      {label}
    </li>
  )
}

// The next two weeks as tiles a sitter can click, seven to a row. A booked day has the deep
// gradient, an available day with nobody booked yet the light one, and a day the sitter does not
// work is plain. The chosen day is the strong solid one. Today reads "Today", the others show their
// weekday. Anything booked after the calendar, or missed, has a pill below, so nothing is hidden
// just because it is further away.
export function TaskWeekCalendar({
  days,
  selected,
  today,
  laterCount,
  missedCount,
  onSelect,
}: TaskWeekCalendarProps) {
  const booked = days.reduce((sum, day) => sum + day.count, 0)
  const knowsAvailability = days.some((day) => day.available !== null)

  return (
    <section aria-labelledby="week-heading" className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <h2 id="week-heading" className="font-heading text-lg">
          Your next 2 weeks
        </h2>
        <p className="text-sm text-muted-foreground">
          {booked === 0 ? 'Nobody booked' : `${plural(booked)} booked`}
        </p>
      </div>

      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isToday = day.date === today
          const isSelected = selected === day.date
          const { day: dayNumber, month } = getSessionDateParts(day.date)
          return (
            <li key={day.date} className="min-w-0">
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={tileLabel(day, today)}
                onClick={() => onSelect(day.date)}
                className={cn(
                  'flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2.5 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-28 sm:py-3',
                  tileLook(day, isSelected),
                  isToday && !isSelected && 'ring-2 ring-primary/60',
                )}
              >
                <span className="text-[10px] font-semibold uppercase sm:text-xs">
                  {isToday ? 'Today' : formatWeekday(day.date)}
                </span>
                <span className="font-heading text-lg tabular-nums sm:text-xl">{dayNumber}</span>
                <span className="hidden text-[10px] uppercase opacity-80 sm:block">{month}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex h-5 items-center justify-center gap-0.5 text-xs font-semibold',
                    day.count === 0 && 'text-[10px] opacity-60 sm:text-xs',
                  )}
                >
                  {tileNote(day)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {knowsAvailability && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs text-muted-foreground">
          <LegendItem
            label="Booked"
            className="border-primary/40 bg-linear-to-br from-primary/35 to-info-soft"
          />
          <LegendItem
            label="Available, nobody yet"
            className="border-primary/15 bg-linear-to-br from-primary/10 to-card"
          />
          <LegendItem label="Not available" className="bg-card" />
        </ul>
      )}

      {(laterCount > 0 || missedCount > 0) && (
        <div className="flex flex-wrap gap-2 pt-3">
          {laterCount > 0 && (
            <button
              type="button"
              aria-pressed={selected === LATER_DATES}
              onClick={() => onSelect(LATER_DATES)}
              className={cn(
                'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                selected === LATER_DATES
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted',
              )}
            >
              <CalendarClock aria-hidden="true" className="size-4" />
              Later · {plural(laterCount)}
            </button>
          )}
          {missedCount > 0 && (
            <button
              type="button"
              aria-pressed={selected === MISSED_DATES}
              onClick={() => onSelect(MISSED_DATES)}
              className={cn(
                'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                selected === MISSED_DATES
                  ? 'border-transparent bg-warning text-primary-foreground'
                  : 'bg-warning-soft text-warning hover:bg-warning-soft/70',
              )}
            >
              <CircleAlert aria-hidden="true" className="size-4" />
              Missed · {plural(missedCount)}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
