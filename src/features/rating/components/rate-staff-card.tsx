'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { StarRating } from '@/components/shared/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { RATING_COMMENT_MAX_LENGTH } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { Rating } from '@/types'
import { ratingKeys } from '../rating.keys'
import { useBookingRatingQuery, useCreateRating } from '../rating.queries'
import {
  EMPTY_RATING_FORM,
  type RatingFormInput,
  ratingFormSchema,
  toRatingPayload,
} from '../rating.schema'

const CONFLICT = 409

type RateStaffCardProps = {
  bookingId: string
  staffId: string
  staffName: string
  // Who is being rated: the sitter who ran the room, or the driver who ran the ride.
  kind: 'sitter' | 'driver'
}

// What the guardian already said about this staff member, read-only.
function GivenRating({ rating, staffName }: { rating: Rating; staffName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <StarRating value={rating.score} />
        <span className="font-semibold">You rated {staffName}</span>
        <time dateTime={rating.createdAt} className="text-muted-foreground">
          on {formatDate(rating.createdAt)}
        </time>
      </p>
      {rating.comment ? (
        <p className="text-sm break-words text-pretty">{rating.comment}</p>
      ) : (
        <p className="text-sm text-muted-foreground">You did not leave a comment.</p>
      )}
    </div>
  )
}

function RatingForm({
  bookingId,
  staffId,
  staffName,
}: Pick<RateStaffCardProps, 'bookingId' | 'staffId' | 'staffName'>) {
  const queryClient = useQueryClient()
  const createRating = useCreateRating()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: EMPTY_RATING_FORM as RatingFormInput,
    validators: { onChange: ratingFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await createRating.mutateAsync(toRatingPayload({ bookingId, staffId }, value))
        toast.success(`Thank you. Your rating for ${staffName} was sent.`)
      } catch (error) {
        // "Already rated" and "nothing to rate yet" are 409s the backend words clearly. Show them
        // as they are, and re-check, since a 409 may mean the rating exists after all.
        setServerError(getErrorMessage(error))
        if (isApiError(error) && error.status === CONFLICT) {
          queryClient.invalidateQueries({ queryKey: ratingKeys.forBooking(staffId, bookingId) })
        }
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <form.AppField name="score">
        {(field) => <field.RatingField label={`How was ${staffName}?`} />}
      </form.AppField>
      <form.AppField name="comment">
        {(field) => (
          <field.TextareaField
            label="Comment"
            optional
            rows={3}
            maxLength={RATING_COMMENT_MAX_LENGTH}
            placeholder="Tell other guardians what it was like"
            hint={`Up to ${RATING_COMMENT_MAX_LENGTH} characters. Other guardians see your first name and last initial.`}
          />
        )}
      </form.AppField>
      <FormError message={serverError} />
      <div className="sm:w-56">
        <form.AppForm>
          <form.SubmitButton>Send rating</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  )
}

// One staff member the guardian may rate for a booking: a form while they have not, their rating
// once they have. The backend allows one rating per staff member per booking.
export function RateStaffCard({ bookingId, staffId, staffName, kind }: RateStaffCardProps) {
  const rating = useBookingRatingQuery(staffId, bookingId)
  const heading = kind === 'sitter' ? 'Your sitter' : 'Your driver'

  function renderBody() {
    if (rating.isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-2">
          <span className="sr-only">Checking your rating</span>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      )
    }
    if (rating.isError) {
      return (
        <p role="alert" className="text-sm text-destructive">
          We could not check whether you already rated {staffName}.{' '}
          <button
            type="button"
            onClick={() => rating.refetch()}
            className="cursor-pointer rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Try again
          </button>
        </p>
      )
    }
    if (rating.data) return <GivenRating rating={rating.data} staffName={staffName} />
    return <RatingForm bookingId={bookingId} staffId={staffId} staffName={staffName} />
  }

  return (
    <section
      aria-label={`Rate ${kind} ${staffName}`}
      className="flex flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <h2 className="text-base">
        {heading}: {staffName}
      </h2>
      {renderBody()}
    </section>
  )
}
