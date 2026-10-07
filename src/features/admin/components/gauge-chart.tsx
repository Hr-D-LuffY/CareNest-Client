'use client'

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

type GaugeChartProps = {
  // 0–100.
  percent: number
  // A chart token such as "var(--chart-1)".
  color: string
}

const CONFIG = { value: { label: 'Share' } } satisfies ChartConfig

// A ring that fills to a percentage. The number sits in the middle (the parent overlays it), so the
// chart itself only draws the ring.
export function GaugeChart({ percent, color }: GaugeChartProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer config={CONFIG} className="mx-auto aspect-square h-40">
      <RadialBarChart
        data={[{ value: percent }]}
        startAngle={90}
        endAngle={-270}
        innerRadius={58}
        outerRadius={78}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="value"
          fill={color}
          cornerRadius={10}
          background
          isAnimationActive={!reduceMotion}
        />
      </RadialBarChart>
    </ChartContainer>
  )
}
