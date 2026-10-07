import { APP_UTC_OFFSET } from '@/lib/constants'
import { addDaysIso, formatSessionDate } from '@/lib/format'

// The backend answers GET /staff/me/earnings with one total for the whole window it is asked about, so
// a chart is made by asking once for every period (a day, a week or a month) and putting the answers
// side by side.
export const EARNINGS_RANGES = [
  { value: '7d', label: '7 days', title: 'Last 7 days', unit: 'day', count: 7 },
  { value: '8w', label: '8 weeks', title: 'Last 8 weeks', unit: 'week', count: 8 },
  { value: '6m', label: '6 months', title: 'Last 6 months', unit: 'month', count: 6 },
] as const

export type EarningsRange = (typeof EARNINGS_RANGES)[number]['value']
export type EarningsUnit = (typeof EARNINGS_RANGES)[number]['unit']

const DEFAULT_EARNINGS_RANGE: EarningsRange = '8w'

// The range from the URL (?range=). A hand-edited value falls back to the default.
export function parseEarningsRange(raw: string | null | undefined): EarningsRange {
  return EARNINGS_RANGES.find((option) => option.value === raw)?.value ?? DEFAULT_EARNINGS_RANGE
}

// The query of GET /staff/me/earnings: both ends are instants, and the backend counts work finished
// from `from` up to and including `to`.
export type EarningsWindow = { from: string; to: string }

// One day, week or month of the chart.
export type EarningsPeriod = EarningsWindow & {
  // The first calendar day, unique within a range: the key of the row and of the query.
  start: string
  // Under a bar or in a list: "Mon", "12 Oct", "Oct".
  label: string
  // In a tooltip or a table: "Mon, 12 Oct", "12 – 18 Oct", "October 2026".
  fullLabel: string
  // The day, week or month that has not finished yet.
  isCurrent: boolean
}

const MONTH_FORMAT = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' })
const MONTH_LONG_FORMAT = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const DAY_MONTH_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const asDate = (day: string) => new Date(`${day}T00:00:00Z`)

// A period from its first to its last calendar day (inclusive) in the platform's time zone. Local
// midnight to the last millisecond of the last day, so no check-out falls between two periods.
function windowOf(firstDay: string, lastDay: string): EarningsWindow {
  return {
    from: `${firstDay}T00:00:00.000${APP_UTC_OFFSET}`,
    to: `${lastDay}T23:59:59.999${APP_UTC_OFFSET}`,
  }
}

function dayPeriod(day: string, today: string): EarningsPeriod {
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(
    asDate(day),
  )
  return {
    ...windowOf(day, day),
    start: day,
    label: weekday,
    fullLabel: formatSessionDate(day),
    isCurrent: day === today,
  }
}

function weekPeriod(monday: string, today: string): EarningsPeriod {
  const sunday = addDaysIso(monday, 6)
  const start = DAY_MONTH_FORMAT.format(asDate(monday))
  const end = DAY_MONTH_FORMAT.format(asDate(sunday))
  const sameMonth = asDate(monday).getUTCMonth() === asDate(sunday).getUTCMonth()
  return {
    ...windowOf(monday, sunday),
    start: monday,
    label: start,
    // "12 – 18 Oct", or "28 Sep – 4 Oct" when the week crosses a month.
    fullLabel: `${sameMonth ? (start.split(' ')[0] ?? start) : start} – ${end}`,
    isCurrent: today >= monday && today <= sunday,
  }
}

function monthPeriod(year: number, month: number, today: string): EarningsPeriod {
  const first = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDayNumber = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const last = `${year}-${String(month).padStart(2, '0')}-${String(lastDayNumber).padStart(2, '0')}`
  return {
    ...windowOf(first, last),
    start: first,
    label: MONTH_FORMAT.format(asDate(first)),
    fullLabel: MONTH_LONG_FORMAT.format(asDate(first)),
    isCurrent: today >= first && today <= last,
  }
}

// The periods of a range, oldest first, the last one being the one that contains `today`
// ("YYYY-MM-DD" in the platform's time zone). Weeks run Monday to Sunday.
export function buildEarningsPeriods(range: EarningsRange, today: string): EarningsPeriod[] {
  const { unit, count } = EARNINGS_RANGES.find((option) => option.value === range) ?? {
    unit: 'week' as const,
    count: 8,
  }
  const steps = Array.from({ length: count }, (_, index) => count - 1 - index)

  if (unit === 'day') return steps.map((back) => dayPeriod(addDaysIso(today, -back), today))

  if (unit === 'week') {
    const sinceMonday = (asDate(today).getUTCDay() + 6) % 7
    const thisMonday = addDaysIso(today, -sinceMonday)
    return steps.map((back) => weekPeriod(addDaysIso(thisMonday, -7 * back), today))
  }

  const [year = 0, month = 1] = today.split('-').map(Number)
  return steps.map((back) => {
    const index = year * 12 + (month - 1) - back
    return monthPeriod(Math.floor(index / 12), (index % 12) + 1, today)
  })
}
