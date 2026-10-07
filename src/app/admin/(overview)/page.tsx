import type { Metadata } from 'next'
import { Reveal } from '@/components/motion/reveal'
import { getAnalytics } from '@/features/admin/admin.server'
import { parseAnalyticsRange } from '@/features/admin/analytics.params'
import { buildBoard } from '@/features/admin/board-data'
import { AnalyticsBoard } from '@/features/admin/components/analytics-board'
import { RangePicker } from '@/features/admin/components/range-picker'

export const metadata: Metadata = { title: 'Overview' }

type OverviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The admin's analytics board. Money and activity per day come from the audit log (the backend has
// no per-day endpoint), seats per day from GET /room?date=, and the platform totals from
// GET /admin/dashboard-stats. Every section is fetched at once and fails on its own, so one slow
// endpoint shows an inline message instead of taking the page down. The period (?range=) is in the URL.
export default async function AdminOverviewPage({ searchParams }: OverviewPageProps) {
  const raw = await searchParams
  const range = parseAnalyticsRange(first(raw.range))
  const board = buildBoard(await getAnalytics(range))

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Overview</h1>
          <p className="text-muted-foreground">
            How CareNest is doing: money earned each day, seats filled, waitlists moving and who
            guardians rate highest.
          </p>
        </header>
      </Reveal>

      <RangePicker />

      <AnalyticsBoard board={board} />
    </div>
  )
}
