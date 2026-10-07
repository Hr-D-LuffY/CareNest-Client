import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StaffType } from '@/types'
import type { EarningsUnit } from '../earnings.params'
import type { EarningsPoint, EarningsSeries } from '../earnings-model'

// What the earnings page's panels receive: the same numbers, and which of the two income
// streams this staff member has (a sitter earns care fees, a driver trip fares, "both" earns both).
export type EarningsPanelProps = {
  series: EarningsSeries
  unit: EarningsUnit
  // "Last 8 weeks"
  rangeTitle: string
  showCare: boolean
  showTrips: boolean
  staffType: StaffType | undefined
}

// Colours come from the chart tokens in globals.css (brown/peach for care, amber for trips).
export const EARNINGS_CHART_CONFIG = {
  care: { label: 'Care fees', color: 'var(--chart-1)' },
  trips: { label: 'Trip fares', color: 'var(--chart-trips)' },
  total: { label: 'Total', color: 'var(--chart-1)' },
} satisfies ChartConfig

export const streamsOf = (staffType: StaffType | undefined) => ({
  showCare: staffType !== StaffType.DRIVER,
  showTrips: staffType !== StaffType.SITTER,
})

export const countText = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

// "this week" / "today" / "this month" beside the period that has not finished.
export const currentLabel = (unit: EarningsUnit) => (unit === 'day' ? 'today' : `this ${unit}`)

// A bar can be drawn as a share of the biggest period. Display only (never shown as an amount).
export function shareOfMax(value: number, max: number): number {
  return max > 0 ? Math.round((value / max) * 100) : 0
}

type TooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
  showCare: boolean
  showTrips: boolean
  unit: EarningsUnit
  // The point under the cursor, found by the caller (it knows its chart's payload shape).
  pointOf: (payload: ReadonlyArray<{ payload?: unknown }>) => EarningsPoint | undefined
}

// The hover card of the bar and area charts: the period, each stream with its count, and the total.
export function EarningsTooltip({
  active,
  payload,
  showCare,
  showTrips,
  unit,
  pointOf,
}: TooltipProps) {
  const point = active && payload ? pointOf(payload) : undefined
  if (!point) return null

  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-card">
      <p className="font-medium">
        {point.fullLabel}
        {point.isCurrent && (
          <span className="font-normal text-muted-foreground"> · {currentLabel(unit)}</span>
        )}
      </p>
      {showCare && (
        <Row
          color="var(--chart-1)"
          label={`Care fees · ${countText(point.careCount, 'session', 'sessions')}`}
          value={formatBDT(point.careText)}
        />
      )}
      {showTrips && (
        <Row
          color="var(--chart-trips)"
          label={`Trip fares · ${countText(point.tripCount, 'trip', 'trips')}`}
          value={formatBDT(point.tripsText)}
        />
      )}
      {showCare && showTrips && (
        <p className="flex items-center justify-between gap-4 border-t pt-1.5 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatBDT(point.totalText)}</span>
        </p>
      )}
    </div>
  )
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </p>
  )
}

// The same numbers as text: the screen-reader alternative to the chart. Pass `className="sr-only"`
// to hide it visually.
export function EarningsTable({
  series,
  unit,
  showCare,
  showTrips,
  className,
}: Pick<EarningsPanelProps, 'series' | 'unit' | 'showCare' | 'showTrips'> & {
  className?: string
}) {
  const showSplit = showCare && showTrips
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="capitalize">
            {unit}
          </TableHead>
          {showCare && <TableHead scope="col">Care fees</TableHead>}
          {showTrips && <TableHead scope="col">Trip fares</TableHead>}
          {showSplit && <TableHead scope="col">Total</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {series.points.map((point) => (
          <TableRow key={point.start}>
            <TableCell className="font-medium whitespace-nowrap">
              {point.fullLabel}
              {point.isCurrent && (
                <span className="font-normal text-muted-foreground"> · {currentLabel(unit)}</span>
              )}
            </TableCell>
            {showCare && (
              <TableCell className="tabular-nums">
                {formatBDT(point.careText)}
                <span className="text-muted-foreground"> · {point.careCount}</span>
              </TableCell>
            )}
            {showTrips && (
              <TableCell className="tabular-nums">
                {formatBDT(point.tripsText)}
                <span className="text-muted-foreground"> · {point.tripCount}</span>
              </TableCell>
            )}
            {showSplit && (
              <TableCell className="font-semibold tabular-nums">
                {formatBDT(point.totalText)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// A period (or the whole range) with nothing finished in it. It says what turns work into income.
export function EarningsEmpty({
  staffType,
  className,
}: {
  staffType: StaffType | undefined
  className?: string
}) {
  const isDriver = staffType === StaffType.DRIVER
  return (
    <EmptyState
      bare
      icon={TrendingUp}
      title="No earnings in this period"
      description={
        isDriver
          ? 'A trip counts as soon as you end it. Pick a longer range, or end a trip to see it here.'
          : staffType === StaffType.BOTH
            ? 'A care fee counts when you check a child out, and a fare when you end a trip. Pick a longer range, or finish one to see it here.'
            : 'A care fee counts when you check a child out. Pick a longer range, or check a child out to see it here.'
      }
      className={className}
      action={
        <Link
          href={isDriver ? '/staff/trips' : '/staff'}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
        >
          {isDriver ? 'Open trips' : 'Open tasks'}
        </Link>
      }
    />
  )
}
