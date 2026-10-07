'use client'

import { CalendarCheck, Navigation, Route, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { TRANSPORT_BASE_FARE } from '@/lib/constants'
import { formatBDT, formatSessionDate, todayIso } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Trip, VerificationStatus } from '@/types'
import { useStaffProfileQuery } from '../staff.queries'
import { ON_THE_WAY_PARAMS, parseTripViewParams, TRIP_TABS, toTripListParams } from '../trip.params'
import { useBusyTripIds, useEndTrip, useStaffTripsQuery, useStartTrip } from '../trip.queries'
import { groupTripsByDay } from '../trip-model'
import { EndTripDialog, type TripActions, TripCard } from './trip-card'
import { TripHistoryTable } from './trip-history-table'
import { TripListSkeleton } from './trip-skeleton'

const EMPTY_COPY = {
  completed: {
    title: 'No completed trips yet',
    description: 'A trip you end appears here with how long it took and the fare.',
  },
  cancelled: {
    title: 'No cancelled trips',
    description: 'A ride a guardian cancels before you start it is listed here.',
  },
} as const

// The driver's rate and the flat base fare, so a driver can see what a trip will bring in.
function RateNote({ perMinuteRate }: { perMinuteRate: string | null | undefined }) {
  if (perMinuteRate === undefined) return null
  if (perMinuteRate === null) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          You have no per-minute rate yet, so a trip cannot be priced or ended. An admin sets it.
        </span>
      </p>
    )
  }
  return (
    <p className="text-sm text-muted-foreground">
      A trip brings in{' '}
      <span className="font-semibold text-foreground tabular-nums">
        {formatBDT(TRANSPORT_BASE_FARE)}
      </span>{' '}
      plus{' '}
      <span className="font-semibold text-foreground tabular-nums">{formatBDT(perMinuteRate)}</span>{' '}
      for every minute of the ride.
    </p>
  )
}

// The driver's trips. The trips that are on the way are always at the top, whatever tab is open, so
// a child who has been picked up is never out of sight. Below, the tab (?tab=&page=) is the single
// source of truth for the list, so a refresh or a shared link shows the same page. The server page
// has already prefetched the first load. Starting and ending a trip are optimistic: the trip moves
// at once and comes back if the backend refuses.
export function TripsView() {
  const query = useQueryParams()
  const session = useSession()
  const today = todayIso()
  const now = useNow()

  const params = parseTripViewParams({ page: query.get('page'), tab: query.get('tab') })
  const isUpcoming = params.tab === 'upcoming'
  const onTheWay = useStaffTripsQuery(ON_THE_WAY_PARAMS)
  const list = useStaffTripsQuery(toTripListParams(params))
  const profile = useStaffProfileQuery()
  const startTrip = useStartTrip()
  const endTrip = useEndTrip()
  const busyIds = useBusyTripIds()
  const [tripToEnd, setTripToEnd] = useState<Trip | null>(null)

  const meta = list.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1
  const perMinuteRate = profile.data ? profile.data.perMinuteRate : undefined

  // Ending the last trip on a later history page (or a hand-edited ?page=9) leaves an empty page.
  // Step back to the last page that has rows.
  useEffect(() => {
    if (!isUpcoming && meta && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [isUpcoming, meta, total, params.page, lastPage, query])

  const actions: TripActions = {
    today,
    now,
    // The backend does not gate these on verification, but an unverified account is not meant to
    // take trips yet (the banner above says so).
    canAct: session.verificationStatus === VerificationStatus.VERIFIED,
    busyIds,
    onStart: (trip) => startTrip.mutate(trip),
    onEnd: setTripToEnd,
  }

  const activeTrips = onTheWay.data?.items ?? []

  function renderUpcoming() {
    const trips = list.data?.items ?? []
    if (trips.length === 0) {
      return (
        <EmptyState
          icon={Route}
          title="No upcoming trips"
          description="When a guardian requests a ride in one of your vehicles it appears here. Guardians can only book vehicles of verified drivers."
          action={
            <Link
              href="/staff/vehicles"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
            >
              Manage vehicles
            </Link>
          }
        />
      )
    }

    return (
      <div className="flex flex-col gap-6">
        {groupTripsByDay(trips, today).map((day) => (
          <section
            key={day.date}
            aria-labelledby={`day-${day.date}`}
            className="flex flex-col gap-3"
          >
            <h2 id={`day-${day.date}`} className="font-heading text-lg">
              {day.label}
              {(day.date === today || day.label === 'Tomorrow') && (
                <span className="text-muted-foreground"> · {formatSessionDate(day.date)}</span>
              )}
              {day.date < today && <span className="text-warning"> · missed</span>}
              <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                {day.trips.length} {day.trips.length === 1 ? 'trip' : 'trips'}
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {day.trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} actions={actions} />
              ))}
            </div>
          </section>
        ))}
        {meta && total > (list.data?.items.length ?? 0) && (
          <p className="text-sm text-muted-foreground">
            Showing your next {list.data?.items.length} of {total} trips.
          </p>
        )}
      </div>
    )
  }

  function renderList() {
    if (list.isPending) return <TripListSkeleton />
    if (list.isError && !list.data) return <ListErrorState onRetry={() => list.refetch()} />
    if (params.tab === 'upcoming') return renderUpcoming()

    const copy = EMPTY_COPY[params.tab]
    return (
      <TripHistoryTable
        data={list.data}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={query.setPage}
        empty={
          <EmptyState icon={CalendarCheck} title={copy.title} description={copy.description} />
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Trips</h1>
            <p className="text-muted-foreground">
              Start a ride on the session day and end it when the child is dropped off. Ending a
              trip charges the fare to the guardian&apos;s wallet.
            </p>
          </div>
          <RateNote perMinuteRate={perMinuteRate} />
        </header>
      </Reveal>

      {activeTrips.length > 0 && (
        <section aria-labelledby="on-the-way-heading" className="flex flex-col gap-3">
          <h2 id="on-the-way-heading" className="flex items-center gap-2 font-heading text-lg">
            <Navigation aria-hidden="true" className="size-5 text-success" />
            On the way now
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {activeTrips.length}
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} actions={actions} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Show</legend>
          {TRIP_TABS.map(({ value, label }) => {
            const selected = params.tab === value
            return (
              <Button
                key={value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="h-10 px-4"
                // "Upcoming" is the default, so it needs no ?tab= in the URL.
                onClick={() => query.set({ tab: value === 'upcoming' ? undefined : value })}
              >
                {label}
              </Button>
            )
          })}
        </fieldset>
        {list.data && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
            {total === 1 ? 'trip' : 'trips'}
          </p>
        )}
      </div>

      <div
        aria-busy={list.isFetching || undefined}
        className={cn('transition-opacity', list.isFetching && !list.isPending && 'opacity-60')}
      >
        {renderList()}
      </div>

      <EndTripDialog
        trip={tripToEnd}
        perMinuteRate={perMinuteRate ?? null}
        onOpenChange={(open) => {
          if (!open) setTripToEnd(null)
        }}
        onConfirm={(trip) => {
          endTrip.mutate(trip)
          setTripToEnd(null)
        }}
      />
    </div>
  )
}
