'use client'

import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { formatCompactBDT } from '@/lib/format'
import { isEarningsPoint } from '../earnings-model'
import { EARNINGS_CHART_CONFIG, type EarningsPanelProps, EarningsTooltip } from './earnings-parts'

// The total as one smooth area. Hover (or focus) a point for the split between the streams.
export function EarningsAreaChart({
  series,
  unit,
  showCare,
  showTrips,
}: Pick<EarningsPanelProps, 'series' | 'unit' | 'showCare' | 'showTrips'>) {
  const reduceMotion = usePrefersReducedMotion()
  // A driver's only stream is trip fares, so the line wears that colour (and not the care colour).
  const lineColor = showCare ? 'var(--color-total)' : 'var(--color-trips)'
  const gradientId = `earnings-fill-${useId().replace(/:/g, '')}`

  return (
    <ChartContainer config={EARNINGS_CHART_CONFIG} className="aspect-auto h-64 w-full">
      <AreaChart accessibilityLayer data={series.points} margin={{ top: 12, right: 8, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          padding={{ left: 16, right: 16 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatCompactBDT}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)' }}
          content={
            <EarningsTooltip
              showCare={showCare}
              showTrips={showTrips}
              unit={unit}
              pointOf={(payload) => {
                const point = payload[0]?.payload
                return isEarningsPoint(point) ? point : undefined
              }}
            />
          }
        />
        <Area
          dataKey="total"
          type="monotone"
          stroke={lineColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={!reduceMotion}
        />
      </AreaChart>
    </ChartContainer>
  )
}
