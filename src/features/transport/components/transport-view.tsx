'use client'

import { Bus, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transport } from '@/types'
import { useCancelRide, useTransportQuery } from '../transport.queries'
import {
  parseTransportViewParams,
  TRANSPORT_TABS,
  toTransportListParams,
} from '../transport-list.params'
import { RideFareExplainer } from './ride-fare-explainer'
import { TransportTable } from './transport-table'

const EMPTY_COPY = {
  all: {
    title: 'No rides yet',
    description:
      'Open a booking and request a supervised ride for that session. Your rides appear here with their driver, route and fare.',
  },
  requested: {
    title: 'No requested rides',
    description: 'A ride you request waits here until the driver starts the trip.',
  },
  'on-the-way': {
    title: 'No rides on the way',
    description: 'A ride shows here while the driver is on the trip.',
  },
  completed: {
    title: 'No completed rides yet',
    description: 'A ride is completed once the driver ends the trip. Its final fare is shown here.',
  },
  cancelled: {
    title: 'No cancelled rides',
    description: 'Rides you cancel, or that were cancelled with their booking, are listed here.',
  },
} as const

function BookingsLink({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard/bookings"
      className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5', className)}
    >
      <CalendarCheck aria-hidden="true" />
      Go to bookings
    </Link>
  )
}

// The guardian's rides. The URL (?tab=&page=) is the single source of truth, so a refresh or a
// shared link shows the same tab and page. The server page has already prefetched the first load.
// Cancelling a ride is optimistic: the row changes at once and comes back if the backend refuses.
export function TransportView() {
  const query = useQueryParams()
  const params = parseTransportViewParams({ page: query.get('page'), tab: query.get('tab') })

  const rides = useTransportQuery(toTransportListParams(params))
  const cancelRide = useCancelRide()
  const [rideToCancel, setRideToCancel] = useState<Transport | null>(null)

  const meta = rides.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // Cancelling the last ride on a later page (or a hand-edited ?page=9) leaves an empty page. Step
  // back to the last page that has rows.
  useEffect(() => {
    if (meta && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [meta, total, params.page, lastPage, query])

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Transport</h1>
            <p className="text-muted-foreground">
              Supervised rides tied to your bookings. Request one from a booking, and follow it
              here.
            </p>
          </div>
          <BookingsLink />
        </header>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Show</legend>
          {TRANSPORT_TABS.map(({ value, label }) => {
            const selected = params.tab === value
            return (
              <Button
                key={value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="h-10 px-4"
                // "All" is the default, so it needs no ?tab= in the URL.
                onClick={() => query.set({ tab: value === 'all' ? undefined : value })}
              >
                {label}
              </Button>
            )
          })}
        </fieldset>
        {rides.data && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
            {total === 1 ? 'ride' : 'rides'}
          </p>
        )}
      </div>

      <TransportTable
        data={rides.data}
        isLoading={rides.isPending}
        isFetching={rides.isFetching}
        isError={rides.isError}
        onRetry={() => rides.refetch()}
        onPageChange={query.setPage}
        onCancel={setRideToCancel}
        empty={
          <EmptyState
            icon={Bus}
            title={EMPTY_COPY[params.tab].title}
            description={EMPTY_COPY[params.tab].description}
            action={params.tab === 'all' ? <BookingsLink /> : undefined}
          />
        }
      />

      <RideFareExplainer />

      <ConfirmDialog
        open={rideToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setRideToCancel(null)
        }}
        title={
          rideToCancel
            ? `Cancel the ride for ${rideToCancel.booking.child.name} on ${formatSessionDate(rideToCancel.booking.sessionDate)}?`
            : 'Cancel ride?'
        }
        description="The driver will not start this trip and nothing is charged. You can request a ride again from the booking until the session day."
        confirmLabel="Cancel ride"
        cancelLabel="Keep ride"
        onConfirm={() => {
          if (rideToCancel) cancelRide.mutate(rideToCancel.id)
          setRideToCancel(null)
        }}
      />
    </div>
  )
}
