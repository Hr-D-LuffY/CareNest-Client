import { CalendarClock, CalendarOff, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AssignedBooking, DayOfWeek } from '@/types'
import { LATER_DATES, MISSED_DATES } from '../task.params'
import {
  getCalendarDays,
  getCalendarEnd,
  getDateLabel,
  getDayOfWeek,
  getTaskPhase,
  selectTasks,
} from '../task-model'
import { InCarePanel } from './task-in-care'
import type { TaskActions } from './task-parts'
import { TaskRollCall } from './task-roll-call'
import { TaskWeekCalendar } from './task-week-calendar'

type TaskBoardProps = {
  tasks: readonly AssignedBooking[]
  actions: TaskActions
  // The weekdays the sitter works, or null when that could not be read.
  availableDays: ReadonlySet<DayOfWeek> | null
  // A "YYYY-MM-DD", or "later" / "missed".
  selected: string
  onSelect: (value: string) => void
}

function selectionTitle(selected: string, today: string) {
  if (selected === LATER_DATES) return 'Later'
  if (selected === MISSED_DATES) return 'Missed sessions'
  return getDateLabel(selected, today)
}

// The task board: a calendar of the next two weeks, then the chosen day as a roll call per room,
// with everyone who is in care beside it. Pick a gradient tile to see who is booked for that day.
export function TaskBoard({ tasks, actions, availableDays, selected, onSelect }: TaskBoardProps) {
  const { today } = actions
  const days = getCalendarDays(tasks, today, availableDays)
  const inCare = tasks.filter((task) => getTaskPhase(task, today) === 'in-care')
  const items = selectTasks(tasks, selected, today)
  const laterCount = selectTasks(tasks, LATER_DATES, today).length
  const missedCount = selectTasks(tasks, MISSED_DATES, today).length

  // The next class: the first day after today with anyone booked. Past the calendar's last day it is
  // reached through "Later".
  const nextDate = tasks.find((task) => task.sessionDate > today)?.sessionDate
  const nextCount = nextDate ? tasks.filter((task) => task.sessionDate === nextDate).length : 0

  // True only when availability is known and the chosen day is not one of the sitter's weekdays.
  const isDate = /^\d/.test(selected)
  const notAvailable =
    isDate && availableDays !== null && !availableDays.has(getDayOfWeek(selected))

  function renderEmpty() {
    if (notAvailable) {
      return (
        <EmptyState
          icon={CalendarOff}
          title={
            selected === today
              ? 'Today is not one of your available days'
              : 'Not one of your available days'
          }
          description={`You have no availability set for ${getDayOfWeek(selected)
            .toLowerCase()
            .replace(/^./, (letter) =>
              letter.toUpperCase(),
            )}s, so nobody can be booked on ${formatSessionDate(selected)}. Days you work are shaded on the calendar.`}
          action={
            <Link
              href="/staff/availability"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
            >
              Manage availability
            </Link>
          }
        />
      )
    }
    if (selected === today) {
      return (
        <EmptyState
          icon={ClipboardCheck}
          title="Nobody left to check in today"
          description="Everyone booked for today has been handled, or nobody was booked."
          action={
            nextDate && (
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4"
                onClick={() => onSelect(nextDate <= getCalendarEnd(today) ? nextDate : LATER_DATES)}
              >
                <CalendarClock aria-hidden="true" />
                View next class · {getDateLabel(nextDate, today)} ({nextCount}{' '}
                {nextCount === 1 ? 'child' : 'children'})
              </Button>
            )
          }
        />
      )
    }
    return (
      <EmptyState
        icon={ClipboardCheck}
        title={
          isDate ? `Nobody booked for ${formatSessionDate(selected)} yet` : 'Nothing to show here'
        }
        description={
          isDate
            ? 'This is one of your available days, but no guardian has booked a seat yet.'
            : 'Pick a shaded day on the calendar to see who is coming.'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskWeekCalendar
        days={days}
        selected={selected}
        today={today}
        laterCount={laterCount}
        missedCount={missedCount}
        onSelect={onSelect}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="lg:col-start-2 lg:row-start-1">
          <InCarePanel tasks={inCare} actions={actions} />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-start-1">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectionTitle(selected, today)}</span>{' '}
            · <span className="font-semibold text-foreground tabular-nums">{items.length}</span>{' '}
            {items.length === 1 ? 'child' : 'children'}
          </p>
          {items.length === 0 ? renderEmpty() : <TaskRollCall tasks={items} actions={actions} />}
        </div>
      </div>
    </div>
  )
}
