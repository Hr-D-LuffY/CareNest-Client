'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// recharts is heavy, so the charts load as their own chunks, fetched only on this page and drawn in
// the browser (a chart has no use on the server). Each skeleton holds its chart's size so nothing
// jumps when the chart arrives.
const block = (className: string) =>
  function ChartLoading() {
    return <Skeleton aria-hidden="true" className={`${className} w-full rounded-lg`} />
  }

export const GaugeChart = dynamic(
  () => import('./gauge-chart').then((module) => module.GaugeChart),
  {
    ssr: false,
    loading: () => <Skeleton aria-hidden="true" className="mx-auto size-40 rounded-full" />,
  },
)

export const TopStaffChart = dynamic(
  () => import('./top-staff-chart').then((module) => module.TopStaffChart),
  { ssr: false, loading: block('h-64') },
)

export const RevenueBarChart = dynamic(
  () => import('./revenue-charts').then((module) => module.RevenueBarChart),
  { ssr: false, loading: block('h-72') },
)

export const OccupancyChart = dynamic(
  () => import('./activity-charts').then((module) => module.OccupancyChart),
  { ssr: false, loading: block('h-72') },
)

export const ActivityChart = dynamic(
  () => import('./activity-charts').then((module) => module.ActivityChart),
  { ssr: false, loading: block('h-72') },
)

export const SplitDonut = dynamic(
  () => import('./activity-charts').then((module) => module.SplitDonut),
  {
    ssr: false,
    loading: () => <Skeleton aria-hidden="true" className="mx-auto size-48 rounded-full" />,
  },
)
