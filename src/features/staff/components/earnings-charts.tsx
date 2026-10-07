'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// recharts is heavy, so each chart is its own chunk, fetched only on this page and drawn in the browser
// (a chart has no use on the server). The skeleton holds the chart's height so nothing jumps.
const loading = (height: string) =>
  function ChartLoading() {
    return <Skeleton aria-hidden="true" className={`${height} w-full rounded-lg`} />
  }

export const EarningsAreaChart = dynamic(
  () => import('./earnings-area-chart').then((module) => module.EarningsAreaChart),
  { ssr: false, loading: loading('h-64') },
)

export const EarningsDonutChart = dynamic(
  () => import('./earnings-donut-chart').then((module) => module.EarningsDonutChart),
  { ssr: false, loading: loading('h-56') },
)
