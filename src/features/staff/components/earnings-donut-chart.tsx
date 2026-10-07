'use client'

import { Cell, Pie, PieChart } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { EARNINGS_CHART_CONFIG, type EarningsPanelProps } from './earnings-parts'

// How the income splits between care fees and trip fares. Only drawn for staff who have
// both. The amounts sit in the list next to it and the total in the middle (the parent overlays it).
export function EarningsDonutChart({ series }: Pick<EarningsPanelProps, 'series'>) {
  const reduceMotion = usePrefersReducedMotion()
  const slices = [
    { key: 'care', value: Number(series.care), color: 'var(--color-care)' },
    { key: 'trips', value: Number(series.trips), color: 'var(--color-trips)' },
  ]

  return (
    <ChartContainer config={EARNINGS_CHART_CONFIG} className="mx-auto aspect-square h-56">
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="key"
          innerRadius={66}
          outerRadius={96}
          paddingAngle={slices.every((slice) => slice.value > 0) ? 3 : 0}
          strokeWidth={0}
          isAnimationActive={!reduceMotion}
        >
          {slices.map((slice) => (
            <Cell key={slice.key} fill={slice.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
