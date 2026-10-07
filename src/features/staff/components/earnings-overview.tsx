import { Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EarningsAreaChart, EarningsDonutChart } from './earnings-charts'
import {
  countText,
  currentLabel,
  EarningsEmpty,
  type EarningsPanelProps,
  EarningsTable,
  shareOfMax,
} from './earnings-parts'

// What the hero card says under the total: the sessions and trips behind it.
function countsLine({ series, showCare, showTrips }: EarningsPanelProps): string {
  const parts: string[] = []
  if (showCare) parts.push(countText(series.careCount, 'session', 'sessions'))
  if (showTrips) parts.push(countText(series.tripCount, 'trip', 'trips'))
  return parts.join(' · ')
}

// The top card: the total as the headline, a smooth area showing how it moved, and the best period.
function Hero(props: EarningsPanelProps) {
  const { series, unit, rangeTitle, showCare, showTrips, staffType } = props
  const best = series.best

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Total earned · {rangeTitle.toLowerCase()}
            </p>
            <p className="font-heading text-4xl tabular-nums sm:text-5xl">
              {formatBDT(series.total)}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">{countsLine(props)}</p>
          </div>
          {best && (
            <p className="flex items-center gap-2 rounded-full bg-info-soft px-3 py-1.5 text-sm text-info">
              <Trophy aria-hidden="true" className="size-4" />
              <span>
                Best {unit}:{' '}
                <span className="font-semibold tabular-nums">{formatBDT(best.totalText)}</span> ·{' '}
                {best.fullLabel}
              </span>
            </p>
          )}
        </div>

        {series.isEmpty ? (
          <EarningsEmpty staffType={staffType} />
        ) : (
          <>
            <div role="img" aria-label={`${rangeTitle}: ${formatBDT(series.total)} earned`}>
              <EarningsAreaChart
                series={series}
                unit={unit}
                showCare={showCare}
                showTrips={showTrips}
              />
            </div>
            {/* The same numbers as a table, for screen readers. */}
            <EarningsTable
              series={series}
              unit={unit}
              showCare={showCare}
              showTrips={showTrips}
              className="sr-only"
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

// For staff with both streams: how the total splits between care fees and trip fares.
function Sources({ series, rangeTitle }: Pick<EarningsPanelProps, 'series' | 'rangeTitle'>) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Where it comes from</CardTitle>
        <CardDescription>{rangeTitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          role="img"
          aria-label={`${series.careShare}% care fees, ${100 - series.careShare}% trip fares`}
          className="relative"
        >
          <EarningsDonutChart series={series} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-heading text-2xl tabular-nums">{formatBDT(series.total)}</span>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-3">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px] bg-chart-1" />
            <span className="flex-1">
              Care fees
              <span className="block text-xs text-muted-foreground">
                {countText(series.careCount, 'session', 'sessions')} · {series.careShare}%
              </span>
            </span>
            <span className="font-semibold tabular-nums">{formatBDT(series.care)}</span>
          </li>
          <li className="flex items-center gap-3">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px] bg-chart-trips" />
            <span className="flex-1">
              Trip fares
              <span className="block text-xs text-muted-foreground">
                {countText(series.tripCount, 'trip', 'trips')} · {100 - series.careShare}%
              </span>
            </span>
            <span className="font-semibold tabular-nums">{formatBDT(series.trips)}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

// Every period as a row with a bar, newest first, so the best ones stand out without reading an axis.
function ByPeriod({
  series,
  unit,
  both,
  className,
}: Pick<EarningsPanelProps, 'series' | 'unit'> & { both: boolean; className?: string }) {
  const max = Math.max(0, ...series.points.map((point) => point.total))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-heading text-lg">By {unit}</CardTitle>
        <CardDescription>The longest bar is the best {unit}.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3">
          {[...series.points].reverse().map((point) => {
            const isBest = series.best?.start === point.start
            return (
              <li key={point.start} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    {isBest && <Trophy aria-label="Best" className="size-3.5 text-chart-trips" />}
                    <span className={cn(isBest && 'font-semibold')}>{point.fullLabel}</span>
                    {point.isCurrent && (
                      <span className="text-xs text-muted-foreground">· {currentLabel(unit)}</span>
                    )}
                  </span>
                  <span className="font-semibold tabular-nums">{formatBDT(point.totalText)}</span>
                </div>
                <div
                  aria-hidden="true"
                  className="flex h-2.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full bg-chart-1"
                    style={{ width: `${shareOfMax(point.care, max)}%` }}
                  />
                  <div
                    className="h-full bg-chart-trips"
                    style={{ width: `${shareOfMax(point.trips, max)}%` }}
                  />
                </div>
                {both && point.total > 0 && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatBDT(point.careText)} care · {formatBDT(point.tripsText)} trips
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

// The earnings page body: the hero card (total + trend), then, once there is something to show, where
// it comes from (only for staff with both streams) next to a ranked bar per period.
export function EarningsOverview(props: EarningsPanelProps) {
  const both = props.showCare && props.showTrips

  return (
    <div className="flex flex-col gap-4">
      <Hero {...props} />
      {!props.series.isEmpty && (
        <div className="grid gap-4 lg:grid-cols-5">
          {both && <Sources series={props.series} rangeTitle={props.rangeTitle} />}
          <ByPeriod
            series={props.series}
            unit={props.unit}
            both={both}
            className={both ? 'lg:col-span-3' : 'lg:col-span-5'}
          />
        </div>
      )}
    </div>
  )
}
