import { CalendarCheck } from 'lucide-react'
import { SectionError } from '@/components/shared/section-error'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { GuardianOverview } from '@/features/guardian/guardian.server'
import {
  addDaysIso,
  formatSessionDate,
  formatWeekday,
  getSessionDateParts,
  todayIso,
} from '@/lib/format'
import { cn } from '@/lib/utils'

const WEEK_DAYS = 7

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

// The next seven days as a row of day tiles: today filled in, days with a confirmed session
// marked with a count (and a text alternative), days with nothing dimmed.
export function WeekStrip({ upcoming }: { upcoming: GuardianOverview['upcoming'] }) {
  if (!upcoming.ok) return <SectionError title="Your week" />

  const today = todayIso()
  const days = Array.from({ length: WEEK_DAYS }, (_, offset) => addDaysIso(today, offset))
  const countsByDay = new Map<string, number>()
  for (const session of upcoming.data.all) {
    countsByDay.set(session.sessionDate, (countsByDay.get(session.sessionDate) ?? 0) + 1)
  }
  const sessionsThisWeek = days.reduce((sum, day) => sum + (countsByDay.get(day) ?? 0), 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <h2 className="font-heading text-lg">Your next 7 days</h2>
        <p className="text-sm text-muted-foreground">
          {sessionsThisWeek === 0
            ? 'Nothing booked'
            : plural(sessionsThisWeek, 'session', 'sessions')}
        </p>
      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((day) => {
            const count = countsByDay.get(day) ?? 0
            const isToday = day === today
            const { day: dayNumber, month } = getSessionDateParts(day)
            return (
              <li
                key={day}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center sm:py-3',
                  isToday && 'border-transparent bg-primary text-primary-foreground',
                  !isToday && count > 0 && 'border-info/40 bg-info-soft text-info',
                )}
              >
                <span className="text-[11px] font-medium uppercase sm:text-xs">
                  {formatWeekday(day)}
                </span>
                <span className="font-heading text-lg tabular-nums sm:text-xl">{dayNumber}</span>
                <span className="hidden text-[10px] uppercase sm:block">{month}</span>
                <span
                  className={cn(
                    'mt-0.5 flex h-5 items-center justify-center gap-0.5 text-xs font-semibold',
                    count === 0 && 'opacity-40',
                  )}
                >
                  {count > 0 ? (
                    <>
                      <CalendarCheck aria-hidden="true" className="size-3.5" />
                      {count}
                      <span className="sr-only">
                        {count === 1 ? ' session' : ' sessions'} on {formatSessionDate(day)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">–</span>
                      <span className="sr-only">No sessions on {formatSessionDate(day)}</span>
                    </>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
