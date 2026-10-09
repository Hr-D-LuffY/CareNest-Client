import {
  Activity,
  CalendarPlus,
  CalendarX,
  ListOrdered,
  LogIn,
  LogOut,
  type LucideIcon,
  Star,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { TierBadge } from '@/components/shared/tier-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatActivityTime, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AuditLog, TopRatedStaff } from '@/types'
import { ratingCountText, toStaffScores } from '../admin-model'
import {
  type DayPoint,
  formatCents,
  type OccupancyDay,
  type People,
  type PeriodSummary,
  type RoomFill,
} from '../analytics-model'
import { AuditAction, describeAuditAction } from '../audit-actions'
import { GaugeChart, SplitDonut, TopStaffChart } from './admin-charts'

// ------------------------------------------------------------------ frame

type ChartPanelProps = {
  title: string
  description?: string
  // Sits on the right of the title (a legend, a badge).
  action?: ReactNode
  className?: string
  children: ReactNode
}

// A titled card around a chart or a list. Every layout builds from this, so the three look related.
export function ChartPanel({ title, description, action, className, children }: ChartPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="font-heading text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

// A coloured key for a chart: the colour is always paired with its name.
export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export const MONEY_LEGEND = [
  { color: 'var(--chart-1)', label: 'Care fees' },
  { color: 'var(--chart-trips)', label: 'Trip fares' },
]

export const SEATS_LEGEND = [
  { color: 'var(--chart-1)', label: 'Seats taken' },
  { color: 'var(--chart-2)', label: 'Seats free' },
]

export const ACTIVITY_LEGEND = [
  { color: 'var(--chart-1)', label: 'Bookings made' },
  { color: 'var(--destructive)', label: 'Cancellations' },
  { color: 'var(--success)', label: 'Waitlist promotions' },
]

// ------------------------------------------------------------------ small facts

export function HistoryNote({ truncated }: { truncated: boolean }) {
  if (!truncated) return null
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
      <span>
        The audit log is longer than what this page reads (the newest 1,000 events), so the first
        days of this period may be missing events.
      </span>
    </p>
  )
}

export function NoMoneyYet({ rangeTitle }: { rangeTitle: string }) {
  return (
    <EmptyState
      bare
      icon={Wallet}
      title="No money earned in this period"
      description={`${rangeTitle}: no care fee was charged at a check-out and no trip fare at the end of a trip. Pick a longer period, or finish a session to see it here.`}
    />
  )
}

// ------------------------------------------------------------------ gauges and staff

type GaugeProps = {
  title: string
  // 0–100.
  percent: number
  color: string
  meaning: string
  whenZero: string
}

// One ring with its percentage in the middle and a line saying what it measures.
export function Gauge({ title, percent, color, meaning, whenZero }: GaugeProps) {
  return (
    <figure className="flex flex-col items-center gap-3 text-center">
      <div role="img" aria-label={`${title}: ${percent}%`} className="relative">
        <GaugeChart percent={percent} color={color} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="font-heading text-3xl tabular-nums">{percent}%</span>
        </div>
      </div>
      <figcaption className="flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-pretty text-muted-foreground">
          {percent === 0 ? whenZero : meaning}
        </span>
      </figcaption>
    </figure>
  )
}

function TopStaffEmpty() {
  return (
    <EmptyState
      bare
      icon={Star}
      title="No ratings yet"
      description="Guardians can rate a sitter or a driver once a session or ride is completed. The best-rated staff will appear here."
    />
  )
}

// The best-rated staff as a bar chart, with the same numbers as a table for screen readers.
export function TopStaffBars({ staff }: { staff: TopRatedStaff[] }) {
  const scores = toStaffScores(staff)
  if (scores.length === 0) return <TopStaffEmpty />

  return (
    <>
      <div
        role="img"
        aria-label={`Top-rated staff: ${scores
          .map((row) => `${row.name} ${row.score.toFixed(1)} out of 5`)
          .join(', ')}`}
      >
        <TopStaffChart staff={scores} />
      </div>
      <Table bare className="sr-only">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Staff member</TableHead>
            <TableHead scope="col">Average rating</TableHead>
            <TableHead scope="col">Ratings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((row) => (
            <TableRow key={row.staffId}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.score.toFixed(1)} out of 5</TableCell>
              <TableCell>{ratingCountText(row.ratingCount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

// ------------------------------------------------------------------ rooms and seats

// Every room at its next session: a bar for how full it is, and the numbers behind the bar.
export function RoomFillList({ rooms }: { rooms: RoomFill[] }) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        bare
        icon={ListOrdered}
        title="No care rooms yet"
        description="Rooms an admin creates will show here with how full they are at their next session."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {rooms.map((room) => {
        const full = room.percent >= 100
        return (
          <li key={room.id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">{room.name}</span>
                <TierBadge tier={room.tier} />
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {room.booked}/{room.capacity} seats
                <span className="font-normal text-muted-foreground"> · {room.percent}%</span>
              </span>
            </div>
            <div
              role="img"
              aria-label={`${room.name}: ${room.booked} of ${room.capacity} seats taken${full ? ', full' : ''}`}
              className="h-2.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn('h-full rounded-full', full ? 'bg-warning' : 'bg-chart-1')}
                style={{ width: `${room.percent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {room.sessionLabel} · {formatTimeRange(room.startTime, room.endTime)} ·{' '}
              {room.staffName}
              {full && ' · Full: new bookings join the waitlist'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// The same seat numbers as a table, for screen readers (the chart above it is a picture).
export function SeatsTable({ days }: { days: OccupancyDay[] }) {
  return (
    <Table bare className="sr-only">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Day</TableHead>
          <TableHead scope="col">Rooms</TableHead>
          <TableHead scope="col">Seats taken</TableHead>
          <TableHead scope="col">Seats</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.date}>
            <TableCell>
              {day.weekday}, {day.label}
            </TableCell>
            <TableCell>{day.sessions}</TableCell>
            <TableCell>{day.booked}</TableCell>
            <TableCell>{day.capacity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ------------------------------------------------------------------ money

// Care fees against trip fares for the period: a donut with the amounts in a list beside it.
export function RevenueSplit({ summary }: { summary: PeriodSummary }) {
  const total = summary.careCents + summary.tripsCents
  if (total === 0) return null
  const carePercent = Math.round((summary.careCents / total) * 100)

  return (
    <div className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={`${carePercent}% care fees, ${100 - carePercent}% trip fares`}
        className="relative"
      >
        <SplitDonut careCents={summary.careCents} tripsCents={summary.tripsCents} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-heading text-xl tabular-nums">{formatCents(total)}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        <li className="flex items-center gap-3">
          <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px] bg-chart-1" />
          <span className="flex-1">
            Care fees
            <span className="block text-xs text-muted-foreground">{carePercent}% of the money</span>
          </span>
          <span className="font-semibold tabular-nums">{formatCents(summary.careCents)}</span>
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px] bg-chart-trips" />
          <span className="flex-1">
            Trip fares
            <span className="block text-xs text-muted-foreground">
              {100 - carePercent}% of the money
            </span>
          </span>
          <span className="font-semibold tabular-nums">{formatCents(summary.tripsCents)}</span>
        </li>
      </ul>
    </div>
  )
}

// ------------------------------------------------------------------ people and activity

export function PeopleBreakdown({ people }: { people: People }) {
  const segments = [
    { key: 'verified', label: 'Verified', value: people.verified, className: 'bg-success' },
    { key: 'unverified', label: 'Waiting', value: people.unverified, className: 'bg-warning' },
    { key: 'rejected', label: 'Rejected', value: people.rejected, className: 'bg-destructive' },
  ]
  const staffTotal = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users aria-hidden="true" className="size-3.5" />
            Guardians
          </dt>
          <dd className="font-heading text-2xl tabular-nums">{people.guardians}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users aria-hidden="true" className="size-3.5" />
            Staff accounts
          </dt>
          <dd className="font-heading text-2xl tabular-nums">{people.staff}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Staff verification</p>
        {staffTotal === 0 ? (
          <p className="text-sm text-muted-foreground">No staff profiles yet.</p>
        ) : (
          <>
            <div
              role="img"
              aria-label={segments
                .map((segment) => `${segment.value} ${segment.label.toLowerCase()}`)
                .join(', ')}
              className="flex h-3 overflow-hidden rounded-full bg-muted"
            >
              {segments.map((segment) => (
                <span
                  key={segment.key}
                  className={segment.className}
                  style={{ width: `${(segment.value / staffTotal) * 100}%` }}
                />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {segments.map((segment) => (
                <li key={segment.key} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={cn('size-2.5 rounded-[2px]', segment.className)}
                  />
                  {segment.label}{' '}
                  <span className="font-semibold text-foreground tabular-nums">
                    {segment.value}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  [AuditAction.BOOKING_CREATED]: CalendarPlus,
  [AuditAction.BOOKING_CANCELLED]: CalendarX,
  [AuditAction.BOOKING_CHECKED_IN]: LogIn,
  [AuditAction.BOOKING_CHECKED_OUT]: LogOut,
  [AuditAction.WAITLIST_PROMOTED]: ListOrdered,
  [AuditAction.WALLET_TOPUP_SUCCEEDED]: Wallet,
  [AuditAction.TRIP_ENDED]: Wallet,
}

// The newest things that happened on the platform, with who did them ("System" for automatic ones).
export function ActivityFeed({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        bare
        icon={Activity}
        title="Nothing has happened yet"
        description="Bookings, payments, trips and verifications will be listed here as they happen."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y">
      {logs.map((log) => {
        const Icon = ACTION_ICONS[log.action] ?? Activity
        return (
          <li key={log.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info-soft text-info"
            >
              <Icon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">
                {describeAuditAction(log.action)}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {log.user?.name ?? 'System'}
              </span>
            </span>
            <time dateTime={log.createdAt} className="shrink-0 text-xs text-muted-foreground">
              {formatActivityTime(log.createdAt)}
            </time>
          </li>
        )
      })}
    </ul>
  )
}

// The money per day as a table, for screen readers (the charts are pictures).
export function MoneyTable({ days }: { days: DayPoint[] }) {
  return (
    <Table bare className="sr-only">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Day</TableHead>
          <TableHead scope="col">Care fees</TableHead>
          <TableHead scope="col">Trip fares</TableHead>
          <TableHead scope="col">Total</TableHead>
          <TableHead scope="col">Added to wallets</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.date}>
            <TableCell>
              {day.weekday}, {day.label}
            </TableCell>
            <TableCell>{formatCents(day.careCents)}</TableCell>
            <TableCell>{formatCents(day.tripsCents)}</TableCell>
            <TableCell>{formatCents(day.totalCents)}</TableCell>
            <TableCell>{formatCents(day.topUpCents)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// "+12% against the 14 days before", for places that only take text.
export function changeText(percent: number | null, compareTo: string): string {
  if (percent === null) return `Nothing earned ${compareTo} to compare with`
  return `${percent > 0 ? '+' : ''}${percent}% against ${compareTo}`
}
