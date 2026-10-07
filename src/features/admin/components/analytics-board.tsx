import { CalendarCheck, ShieldAlert, Users, Wallet } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { SectionError } from '@/components/shared/section-error'
import { StatCard } from '@/components/shared/stat-card'
import { formatBDT } from '@/lib/format'
import { toPercent } from '../admin-model'
import { OCCUPANCY_DAYS } from '../analytics.params'
import { formatCents } from '../analytics-model'
import type { BoardData } from '../board-data'
import { ActivityChart, OccupancyChart, RevenueBarChart } from './admin-charts'
import {
  ACTIVITY_LEGEND,
  ActivityFeed,
  ChartPanel,
  changeText,
  Gauge,
  HistoryNote,
  Legend,
  MONEY_LEGEND,
  MoneyTable,
  NoMoneyYet,
  PeopleBreakdown,
  RevenueSplit,
  RoomFillList,
  SEATS_LEGEND,
  SeatsTable,
  TopStaffBars,
} from './board-parts'

// The admin's analytics board: a strip of headline numbers, then one card per question (money, seats,
// rooms, staff and people, activity), each with its legend.
export function AnalyticsBoard({ board }: { board: BoardData }) {
  const { analytics, summary, revenueChange, previous, compareTo } = board
  const { stats, history, occupancy, rooms, people } = analytics

  const kpis = [
    {
      icon: Wallet,
      label: 'Total revenue',
      value: stats.ok ? formatBDT(stats.data.totalRevenue) : '—',
      hint: 'Care fees and trip fares ever collected',
    },
    {
      icon: Wallet,
      label: `Earned · ${analytics.rangeTitle.toLowerCase()}`,
      value: summary ? formatCents(summary.revenueCents) : '—',
      hint: summary && previous ? changeText(revenueChange, compareTo) : analytics.rangeTitle,
    },
    {
      icon: Wallet,
      label: 'Added to wallets',
      value: summary ? formatCents(summary.topUpCents) : '—',
      hint: `Paid through bKash · ${analytics.rangeTitle.toLowerCase()}`,
    },
    {
      icon: CalendarCheck,
      label: 'Active bookings',
      value: stats.ok ? stats.data.activeBookings.toLocaleString('en-US') : '—',
      hint: 'Confirmed seats plus children on a waitlist',
    },
    {
      icon: Users,
      label: 'Guardians',
      value: people.ok ? String(people.data.guardians) : '—',
      hint: people.ok ? `${people.data.staff} staff accounts` : undefined,
    },
    {
      icon: ShieldAlert,
      label: 'Staff awaiting verification',
      value: people.ok ? String(people.data.unverified) : '—',
      hint: people.ok ? `${people.data.verified} verified so far` : undefined,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <li key={kpi.label}>
              <StatCard {...kpi} />
            </li>
          ))}
        </ul>
      </Reveal>

      {history.ok && <HistoryNote truncated={history.data.truncated} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <ChartPanel
            className="h-full"
            title="Money earned each day"
            description={`${analytics.rangeTitle}. A care fee counts when a child is checked out, a fare when a trip ends.`}
            action={<Legend items={MONEY_LEGEND} />}
          >
            {!history.ok ? (
              <SectionError title="The daily money chart" />
            ) : summary?.revenueCents ? (
              <>
                <div
                  role="img"
                  aria-label={`Money earned each day, ${analytics.rangeTitle.toLowerCase()}: ${formatCents(summary.revenueCents)} in total`}
                >
                  <RevenueBarChart days={history.data.days} />
                </div>
                <MoneyTable days={history.data.days} />
              </>
            ) : (
              <NoMoneyYet rangeTitle={analytics.rangeTitle} />
            )}
          </ChartPanel>
        </Reveal>
        <Reveal delay={0.08}>
          <ChartPanel
            className="h-full"
            title="Where the money comes from"
            description={analytics.rangeTitle}
          >
            {summary && summary.revenueCents > 0 ? (
              <RevenueSplit summary={summary} />
            ) : (
              <p className="text-sm text-muted-foreground">
                The split between care fees and trip fares appears once money has been earned.
              </p>
            )}
          </ChartPanel>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <ChartPanel
            className="h-full"
            title={`Seats over the next ${OCCUPANCY_DAYS} days`}
            description="Seats taken in every room that runs that day. Past days cannot be shown: the backend only counts seats from today onward."
            action={<Legend items={SEATS_LEGEND} />}
          >
            {occupancy.ok ? (
              <>
                <div role="img" aria-label={`Seats taken over the next ${OCCUPANCY_DAYS} days`}>
                  <OccupancyChart days={occupancy.data} />
                </div>
                <SeatsTable days={occupancy.data} />
              </>
            ) : (
              <SectionError title="The seats chart" />
            )}
          </ChartPanel>
        </Reveal>
        <Reveal className="lg:col-span-2" delay={0.08}>
          <ChartPanel
            className="h-full"
            title="Rooms and waitlist"
            description="How full the rooms are and how fair the queue is."
          >
            {stats.ok ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Gauge
                  title="Room occupancy"
                  percent={toPercent(stats.data.roomOccupancyRate)}
                  color="var(--chart-1)"
                  meaning="Seats taken at each room's next session"
                  whenZero="No seats are booked at the next sessions"
                />
                <Gauge
                  title="Waitlist conversion"
                  percent={toPercent(stats.data.waitlistConversionRate)}
                  color="var(--chart-trips)"
                  meaning="Waitlisted children later promoted to a seat"
                  whenZero="Nobody has been promoted from a waitlist yet"
                />
              </div>
            ) : (
              <SectionError title="The occupancy numbers" />
            )}
          </ChartPanel>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <ChartPanel
            className="h-full"
            title="Every room, next session"
            description="Fullest first. A full room sends new bookings to its waitlist."
          >
            {rooms.ok ? (
              <RoomFillList rooms={rooms.data} />
            ) : (
              <SectionError title="The room list" />
            )}
          </ChartPanel>
        </Reveal>
        <Reveal className="flex flex-col gap-4 lg:col-span-2" delay={0.08}>
          <ChartPanel
            title="Top-rated staff"
            description="Average guardian rating out of 5, highest first, up to five staff."
          >
            {stats.ok ? (
              <TopStaffBars staff={stats.data.topRatedStaff} />
            ) : (
              <SectionError title="The staff ratings" />
            )}
          </ChartPanel>
          <ChartPanel className="flex-1" title="People" description="Who is on the platform.">
            {people.ok ? (
              <PeopleBreakdown people={people.data} />
            ) : (
              <SectionError title="The people numbers" />
            )}
          </ChartPanel>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <ChartPanel
            className="h-full"
            title="Bookings, cancellations and promotions"
            description={analytics.rangeTitle}
            action={<Legend items={ACTIVITY_LEGEND} />}
          >
            {history.ok ? (
              <div
                role="img"
                aria-label={`Bookings, cancellations and promotions per day, ${analytics.rangeTitle.toLowerCase()}`}
              >
                <ActivityChart days={history.data.days} />
              </div>
            ) : (
              <SectionError title="The activity chart" />
            )}
          </ChartPanel>
        </Reveal>
        <Reveal className="lg:col-span-2" delay={0.08}>
          <ChartPanel
            className="h-full"
            title="Latest activity"
            description="The newest events on the platform."
          >
            {history.ok ? (
              <ActivityFeed logs={history.data.recent} />
            ) : (
              <SectionError title="The activity feed" />
            )}
          </ChartPanel>
        </Reveal>
      </div>
    </div>
  )
}
