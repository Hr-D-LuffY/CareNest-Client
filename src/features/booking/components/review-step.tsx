'use client'

import { CircleAlert, Hourglass, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { TierBadge } from '@/components/shared/tier-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TopUpLink } from '@/features/wallet/components/top-up-link'
import { DAY_LABEL } from '@/lib/constants'
import { formatBDT, formatMultiplier, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { WizardStep } from '../booking.params'
import type { BookingError } from '../use-booking-form'
import type { Review } from '../use-review'

const SKELETON_IDS = ['a', 'b', 'c', 'd', 'e'] as const
// The backend answers 402 when the wallet cannot cover the estimated fee.
const PAYMENT_REQUIRED = 402

type ReviewStepProps = {
  review: Review
  error: BookingError | null
  onEdit: (step: WizardStep) => void
}

function Row({
  label,
  children,
  onChange,
  changeLabel,
}: {
  label: string
  children: ReactNode
  onChange?: () => void
  changeLabel?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right">
        <span className="min-w-0 break-words">{children}</span>
        {onChange && (
          <Button
            type="button"
            variant="link"
            className="h-auto min-h-9 p-0 text-sm"
            onClick={onChange}
          >
            Change
            <span className="sr-only"> {changeLabel ?? label.toLowerCase()}</span>
          </Button>
        )}
      </dd>
    </div>
  )
}

function Callout({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof Hourglass
  tone: 'warning' | 'danger'
  children: ReactNode
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-2 rounded-xl border p-3 text-sm',
        tone === 'danger'
          ? 'border-destructive/30 bg-destructive-soft'
          : 'border-warning/30 bg-warning-soft',
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'mt-0.5 size-4 shrink-0',
          tone === 'danger' ? 'text-destructive' : 'text-warning',
        )}
      />
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

// Step 3: everything the guardian is about to book, the estimated fee and the wallet balance, with a
// "Change" link back to the step that owns each answer. Nothing is sent until "Confirm" below.
export function ReviewStep({ review, error, onEdit }: ReviewStepProps) {
  const { child, room, isFull, hourlyPrice, estimatedFee, balance, insufficientBalance } = review

  if (review.isLoading) {
    return (
      <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
        <span className="sr-only">Loading your booking summary</span>
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!child || !room) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="We could not load your choices"
        description="The child or the room is no longer available. Go back and choose again."
        action={
          <Button type="button" variant="outline" className="h-10 px-4" onClick={() => onEdit(1)}>
            Start again
          </Button>
        }
      />
    )
  }

  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Review your booking
        </h2>
        <p className="text-sm text-muted-foreground">
          Check the details. Nothing is booked until you confirm.
        </p>
      </div>

      <dl className="flex flex-col divide-y rounded-2xl border bg-card px-5">
        <Row label="Child" onChange={() => onEdit(1)}>
          <span className="inline-flex flex-wrap items-center justify-end gap-2">
            {child.name}
            <TierBadge tier={child.tier} />
          </span>
        </Row>
        <Row label="Room" onChange={() => onEdit(2)}>
          {room.name}
          <span className="block text-xs text-muted-foreground">Run by {room.staff.user.name}</span>
        </Row>
        <Row label="Session" onChange={() => onEdit(2)} changeLabel="session date">
          {formatSessionDate(room.sessionDate)}
          <span className="block text-xs text-muted-foreground">
            Every {DAY_LABEL[room.dayOfWeek]}, {formatTimeRange(room.startTime, room.endTime)}
          </span>
        </Row>
        <Row label="Seats">
          {isFull
            ? 'No seats left, you will join the waitlist'
            : `${room.seatsLeft} of ${room.capacity} left`}
        </Row>
        <Row label="Price per hour">
          {hourlyPrice ? (
            <>
              <span className="tabular-nums">{formatBDT(hourlyPrice)}</span>
              <span className="block text-xs text-muted-foreground">
                Room multiplier {formatMultiplier(room.priceMultiplier)}
              </span>
            </>
          ) : (
            'Not set yet'
          )}
        </Row>
        <Row label="Estimated fee">
          <span className="font-heading text-lg tabular-nums">
            {estimatedFee ? formatBDT(estimatedFee) : '—'}
          </span>
        </Row>
        <Row label="Wallet balance">
          <span className="tabular-nums">{balance === undefined ? '—' : formatBDT(balance)}</span>
        </Row>
      </dl>

      <p className="text-sm text-muted-foreground">
        You are not charged now. The final fee is taken from your wallet at check-out, for the time
        your child actually uses.
      </p>

      {!review.hasRate && (
        <Callout icon={CircleAlert} tone="danger">
          <p>This room has no hourly rate yet, so it cannot be booked. Choose another room.</p>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-fit px-4"
            onClick={() => onEdit(2)}
          >
            Choose another room
          </Button>
        </Callout>
      )}

      {isFull && (
        <Callout icon={Hourglass} tone="warning">
          <p>
            This session is full. Confirming adds {child.name} to the waitlist, ranked by a priority
            score. If a seat opens, the top-ranked child is booked automatically.
          </p>
        </Callout>
      )}

      {insufficientBalance && estimatedFee && balance !== undefined && (
        <Callout icon={Wallet} tone="warning">
          <p>
            Your balance of {formatBDT(balance)} is below the estimated fee of{' '}
            {formatBDT(estimatedFee)}. Top up your wallet to book this session
            {isFull ? ' or join its waitlist' : ''}.
          </p>
          <TopUpLink />
        </Callout>
      )}

      {error && (
        <Callout icon={CircleAlert} tone="danger">
          <p>{error.message}</p>
          {error.status === PAYMENT_REQUIRED && <TopUpLink />}
        </Callout>
      )}
    </section>
  )
}
