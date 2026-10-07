import { APP_TIME_ZONE } from '@/lib/constants'

// Display helpers. The backend sends money as strings, session dates as "YYYY-MM-DD", times as
// "HH:mm" and everything else as ISO timestamps. These only format; they never do money math.

const CURRENCY_SYMBOL = '৳'

// "5000" -> "৳5,000", "1234.5" -> "৳1,234.50". Works on the string, so no float rounding.
export function formatBDT(amount: string | number): string {
  const text = String(amount).trim()
  const negative = text.startsWith('-')
  const [whole = '0', fraction = ''] = text.replace(/^[-+]/, '').split('.')
  const grouped = Number(whole).toLocaleString('en-US')
  const cents = fraction.replace(/0+$/, '')
  const formatted = cents ? `${grouped}.${cents.padEnd(2, '0').slice(0, 2)}` : grouped
  return `${negative ? '-' : ''}${CURRENCY_SYMBOL}${formatted}`
}

// "Sara Khan" -> "Sara K.", for reviews written by other guardians: a first name and an initial.
export function formatShortName(name: string): string {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  return last ? `${first} ${last[0]?.toUpperCase()}.` : first
}

// A room's price multiplier without trailing zeros: "1.00" -> "1×", "1.50" -> "1.5×". Works on the
// string, like formatBDT.
export function formatMultiplier(multiplier: string): string {
  const text = multiplier.trim()
  return `${text.includes('.') ? text.replace(/\.?0+$/, '') : text}×`
}

// A short amount for a chart axis: 1500 -> "৳1.5K". Display only; every exact amount uses formatBDT.
export function formatCompactBDT(amount: number): string {
  return `${CURRENCY_SYMBOL}${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`
}

// A session date is a calendar day with no time zone, so it is read as UTC to never shift a day.
function parseSessionDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

// Today as "YYYY-MM-DD" in UTC. The backend decides "today" the same way (check-in day, whether a
// booking can still be cancelled), so "upcoming" here matches what it will accept.
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// "2026-10-12" -> "Mon, 12 Oct"
export function formatSessionDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parseSessionDate(date))
}

// "2021-03-04" or "2021-03-04T00:00:00.000Z" -> "4 Mar 2021". A birthday is a calendar day, so it
// is read as UTC and never shifts.
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseSessionDate(date.slice(0, 10)))
}

// "2026-10-12" -> { day: "12", month: "Oct" }, for the date tile on a session row.
export function getSessionDateParts(date: string): { day: string; month: string } {
  const parsed = parseSessionDate(date)
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' }).format(parsed),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(parsed),
  }
}

// "2026-10-12" -> "Mon"
export function formatWeekday(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(
    parseSessionDate(date),
  )
}

// "2026-10-12" plus 3 days -> "2026-10-15"
export function addDaysIso(date: string, days: number): string {
  return new Date(parseSessionDate(date).getTime() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

// A child's age from their date of birth: "4 yrs", "1 yr" or "7 mo" for a baby under one.
export function formatAge(dateOfBirth: string, today: string = todayIso()): string {
  const [by = 0, bm = 0, bd = 0] = dateOfBirth.slice(0, 10).split('-').map(Number)
  const [ty = 0, tm = 0, td = 0] = today.split('-').map(Number)
  const months = (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0)
  if (months < 12) return `${Math.max(months, 0)} mo`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'yr' : 'yrs'}`
}

// The backend's hoursUsed ("1.2500") -> "1.25 h". Display only: the fee is computed by the backend.
export function formatHours(hours: string): string {
  const value = Number(hours)
  return `${Number.isFinite(value) ? Number(value.toFixed(2)) : hours} h`
}

// "14:30" -> "2:30 PM"
export function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

// A calendar day key ("YYYY-MM-DD") for an instant, in the platform's time zone.
function localDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIME_ZONE }).format(date)
}

// The platform-clock calendar day ("YYYY-MM-DD") an ISO timestamp falls on: which day a payment or a
// check-out counts for.
export function dayInAppZone(iso: string): string {
  return localDayKey(new Date(iso))
}

// Today as "YYYY-MM-DD" on the platform's clock (Asia/Dhaka), for the periods an earnings chart groups by.
export function todayInAppZone(): string {
  return localDayKey(new Date())
}

// "Today, 3:45 PM" / "Yesterday, 9:10 AM" / "5 Oct, 3:45 PM" for an ISO timestamp.
export function formatActivityTime(iso: string): string {
  const date = new Date(iso)
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: APP_TIME_ZONE,
  })
    .format(date)
    .toUpperCase()

  const now = new Date()
  const key = localDayKey(date)
  if (key === localDayKey(now)) return `Today, ${time}`
  if (key === localDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))) {
    return `Yesterday, ${time}`
  }
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: APP_TIME_ZONE,
  }).format(date)
  return `${day}, ${time}`
}
