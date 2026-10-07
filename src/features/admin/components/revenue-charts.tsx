'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { formatCompactBDT } from '@/lib/format'
import { type DayPoint, formatCents, isDayPoint } from '../analytics-model'
import { ADMIN_CHART_CONFIG, ChartTip, DAY_AXIS } from './chart-parts'

const dayTitle = (day: DayPoint) => `${day.weekday}, ${day.label}${day.isToday ? ' · today' : ''}`

const MARGIN = { top: 12, right: 8, left: 0 }

function Axes() {
  return (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} {...DAY_AXIS} />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={52}
        tickFormatter={formatCompactBDT}
        allowDecimals={false}
      />
    </>
  )
}

// Money earned each day, care fees stacked under trip fares.
export function RevenueBarChart({ days, height = 288 }: { days: DayPoint[]; height?: number }) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer config={ADMIN_CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart accessibilityLayer data={days} margin={MARGIN}>
        <Axes />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)' }}
          content={
            <ChartTip
              isRow={isDayPoint}
              title={dayTitle}
              rows={(day) => [
                { color: 'var(--chart-1)', label: 'Care fees', value: formatCents(day.careCents) },
                {
                  color: 'var(--chart-trips)',
                  label: 'Trip fares',
                  value: formatCents(day.tripsCents),
                },
              ]}
              footer={(day) => `Total ${formatCents(day.totalCents)}`}
            />
          }
        />
        <Bar
          dataKey="care"
          stackId="money"
          fill="var(--color-care)"
          radius={[0, 0, 4, 4]}
          isAnimationActive={!reduceMotion}
        />
        <Bar
          dataKey="trips"
          stackId="money"
          fill="var(--color-trips)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={!reduceMotion}
        />
      </BarChart>
    </ChartContainer>
  )
}
