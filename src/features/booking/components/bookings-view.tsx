'use client'

import { CalendarCheck, CalendarPlus, Hourglass } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types'
import { useBookingsQuery, useCancelBooking, useWaitlistQuery } from '../booking.queries'
import {
  BOOKING_TABS,
  parseBookingViewParams,
  toBookingListParams,
  toWaitlistListParams,
} from '../booking-list.params'
import { BookingTable } from './booking-table'
import { PriorityScoreExplainer } from './priority-score-explainer'
import { WaitlistTable } from './waitlist-table'

const EMPTY_COPY = {
  all: {
    title: 'No bookings yet',
    description: 'Book a seat in a care room and it shows up here, with its date, status and fee.',
  },
  confirmed: {
    title: 'No confirmed bookings',
    description: 'You have no confirmed seats right now. Book one, or check the other tabs.',
  },
  completed: {
    title: 'No completed sessions yet',
    description: 'A booking is completed once staff check your child out after the session.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    description: 'Bookings you cancel are listed here for your records.',
  },
} as const

function BookSeatLink() {
  return (
    <Link
      href="/dashboard/book"
      className={cn(
        buttonVariants(),
        'h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90',
      )}
    >
      <CalendarPlus aria-hidden="true" />
      Book a seat
    </Link>
  )
}

// The guardian's bookings and waitlist spots. The URL (?tab=&page=) is the single source of truth,
// so a refresh or a shared link shows the same tab and page. The server page has already prefetched
// the first load. Cancelling is optimistic: the row changes at once and comes back if the backend
// refuses.
export function BookingsView() {
  const query = useQueryParams()
  const params = parseBookingViewParams({ page: query.get('page'), tab: query.get('tab') })
  const isWaitlist = params.tab === 'waitlist'

  const bookings = useBookingsQuery(toBookingListParams(params))
  const waitlist = useWaitlistQuery(toWaitlistListParams(params), isWaitlist)
  const cancelBooking = useCancelBooking()
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)

  // The list on screen: waitlist spots on the Waitlisted tab, bookings on the rest.
  const active = isWaitlist ? waitlist : bookings
  const meta = active.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // Cancelling the last booking on a later page (or a hand-edited ?page=9) leaves an empty page.
  // Step back to the last page that has rows.
  useEffect(() => {
    if (meta && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [meta, total, params.page, lastPage, query])

  const emptyBookings =
    params.tab === 'waitlist' ? null : (
      <EmptyState
        icon={CalendarCheck}
        title={EMPTY_COPY[params.tab].title}
        description={EMPTY_COPY[params.tab].description}
        action={params.tab === 'all' ? <BookSeatLink /> : undefined}
      />
    )

  const emptyWaitlist = (
    <EmptyState
      icon={Hourglass}
      title="You are not on any waitlist"
      description="When a room is full on the date you want, booking it puts your child in a fair queue instead of turning you away. Their spot and priority score appear here."
      action={<BookSeatLink />}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Bookings</h1>
            <p className="text-muted-foreground">
              Your sessions and waitlist spots. Cancel a seat and the next child in line is promoted
              automatically.
            </p>
          </div>
          <BookSeatLink />
        </header>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Show</legend>
          {BOOKING_TABS.map(({ value, label }) => {
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
        {active.data && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
            {isWaitlist
              ? total === 1
                ? 'waitlist spot'
                : 'waitlist spots'
              : total === 1
                ? 'booking'
                : 'bookings'}
          </p>
        )}
      </div>

      {isWaitlist ? (
        <>
          <WaitlistTable
            data={waitlist.data}
            isLoading={waitlist.isPending}
            isFetching={waitlist.isFetching}
            isError={waitlist.isError}
            onRetry={() => waitlist.refetch()}
            onPageChange={query.setPage}
            empty={emptyWaitlist}
          />
          {total > 0 && <PriorityScoreExplainer />}
        </>
      ) : (
        <BookingTable
          data={bookings.data}
          isLoading={bookings.isPending}
          isFetching={bookings.isFetching}
          isError={bookings.isError}
          onRetry={() => bookings.refetch()}
          onPageChange={query.setPage}
          onCancel={setBookingToCancel}
          empty={emptyBookings}
        />
      )}

      <ConfirmDialog
        open={bookingToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setBookingToCancel(null)
        }}
        title={
          bookingToCancel
            ? `Cancel ${bookingToCancel.child.name}'s session on ${formatSessionDate(bookingToCancel.sessionDate)}?`
            : 'Cancel booking?'
        }
        description="The seat goes back to the room and the top-ranked child on its waitlist is promoted. Cancelling also counts against your waitlist priority for the next 30 days, and any ride requested for this booking is cancelled."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onConfirm={() => {
          if (bookingToCancel) cancelBooking.mutate(bookingToCancel.id)
          setBookingToCancel(null)
        }}
      />
    </div>
  )
}
