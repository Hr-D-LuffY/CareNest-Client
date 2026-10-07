'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { type DayPoint, isDayPoint, isOccupancyDay, type OccupancyDay } from '../analytics-model'
import { ADMIN_CHART_CONFIG, ChartTip, DAY_AXIS } from './chart-parts'

const MARGIN = { top: 12, right: 8, left: 0 }

// Seats per upcoming day: the taken part of each bar over the free part. A day with no room running
// has no bar (and says so on hover).
export function OccupancyChart({ days, height = 288 }: { days: OccupancyDay[]; height?: number }) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer config={ADMIN_CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart accessibilityLayer data={days} margin={MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} {...DAY_AXIS} />
        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)' }}
          content={
            <ChartTip
              isRow={isOccupancyDay}
              title={(day) => `${day.weekday}, ${day.label}`}
              rows={(day) =>
                day.sessions === 0
                  ? []
                  : [
                      { color: 'var(--chart-1)', label: 'Seats taken', value: String(day.booked) },
                      { color: 'var(--chart-2)', label: 'Seats free', value: String(day.free) },
                    ]
              }
              footer={(day) =>
                day.sessions === 0
                  ? 'No room runs this day'
                  : `${day.percent}% full · ${day.sessions} ${day.sessions === 1 ? 'room' : 'rooms'}`
              }
            />
          }
        />
        <Bar
          dataKey="booked"
          stackId="seats"
          fill="var(--color-booked)"
          radius={[0, 0, 4, 4]}
          isAnimationActive={!reduceMotion}
        />
        <Bar
          dataKey="free"
          stackId="seats"
          fill="var(--color-free)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={!reduceMotion}
        />
      </BarChart>
    </ChartContainer>
  )
}

// Bookings made, cancelled and children promoted from a waitlist, per day.
export function ActivityChart({ days, height = 288 }: { days: DayPoint[]; height?: number }) {
  const reduceMotion = usePrefersReducedMotion()
  const lines = [
    { key: 'bookings', color: 'var(--color-bookings)' },
    { key: 'cancellations', color: 'var(--color-cancellations)' },
    { key: 'promotions', color: 'var(--color-promotions)' },
  ] as const

  return (
    <ChartContainer config={ADMIN_CHART_CONFIG} className="aspect-auto w-full" style={{ height }}>
      <LineChart accessibilityLayer data={days} margin={MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} {...DAY_AXIS} />
        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)' }}
          content={
            <ChartTip
              isRow={isDayPoint}
              title={(day) => `${day.weekday}, ${day.label}`}
              rows={(day) => [
                { color: 'var(--chart-1)', label: 'Bookings made', value: String(day.bookings) },
                {
                  color: 'var(--destructive)',
                  label: 'Cancellations',
                  value: String(day.cancellations),
                },
                {
                  color: 'var(--success)',
                  label: 'Waitlist promotions',
                  value: String(day.promotions),
                },
              ]}
            />
          }
        />
        {lines.map(({ key, color }) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={!reduceMotion}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

// How the money splits between care fees and trip fares. The total sits in the middle (the parent
// overlays it) and the amounts in the list beside it.
export function SplitDonut({ careCents, tripsCents }: { careCents: number; tripsCents: number }) {
  const reduceMotion = usePrefersReducedMotion()
  const slices = [
    { key: 'care', value: careCents, color: 'var(--color-care)' },
    { key: 'trips', value: tripsCents, color: 'var(--color-trips)' },
  ]

  return (
    <ChartContainer config={ADMIN_CHART_CONFIG} className="mx-auto aspect-square h-48">
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="key"
          innerRadius={58}
          outerRadius={84}
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
