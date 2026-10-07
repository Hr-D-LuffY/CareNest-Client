'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { formatShortName } from '@/lib/format'
import { isStaffScore, ratingCountText, type StaffScore } from '../admin-model'

const CONFIG = { score: { label: 'Average rating', color: 'var(--chart-1)' } } satisfies ChartConfig

const ROW_HEIGHT = 52
const AXIS_HEIGHT = 36

type TooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}

function StaffTooltip({ active, payload }: TooltipProps) {
  const row = active ? payload?.[0]?.payload : undefined
  if (!isStaffScore(row)) return null

  return (
    <div className="grid min-w-40 gap-1 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-card">
      <p className="font-medium">{row.name}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Average rating</span>
        <span className="font-medium tabular-nums">{row.score.toFixed(1)} / 5</span>
      </p>
      <p className="text-muted-foreground">{ratingCountText(row.ratingCount)}</p>
    </div>
  )
}

// One bar per staff member, longest first, on a fixed 0–5 scale so the bars are comparable at a
// glance. The score is printed at the end of each bar, so nothing depends on hovering.
export function TopStaffChart({ staff }: { staff: StaffScore[] }) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer
      config={CONFIG}
      className="aspect-auto w-full"
      style={{ height: staff.length * ROW_HEIGHT + AXIS_HEIGHT }}
    >
      <BarChart
        accessibilityLayer
        layout="vertical"
        data={staff}
        margin={{ top: 4, right: 36, bottom: 0, left: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tickLine={false}
          axisLine={false}
          tickMargin={6}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={104}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatShortName}
        />
        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<StaffTooltip />} />
        <Bar dataKey="score" fill="var(--color-score)" radius={6} isAnimationActive={!reduceMotion}>
          <LabelList
            dataKey="score"
            position="right"
            offset={8}
            className="fill-foreground text-xs font-semibold"
            formatter={(value: unknown) => (typeof value === 'number' ? value.toFixed(1) : '')}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
