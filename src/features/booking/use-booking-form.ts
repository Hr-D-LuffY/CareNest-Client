'use client'

import { useState } from 'react'
import { useAppForm } from '@/hooks/use-app-form'
import { useQueryParams } from '@/hooks/use-query-params'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import type { CreateBookingResult } from '@/types'
import { useCreateBooking } from './booking.queries'
import {
  type BookingFormInput,
  bookingFormSchema,
  EMPTY_BOOKING_FORM,
  toBookingPayload,
} from './booking.schema'

export type BookingError = { message: string; status: number }

// The whole booking wizard as ONE form: it stays mounted while the guardian moves between steps, so
// going back and forward keeps every choice. Submitting books the seat, or joins the waitlist when
// the room is full; `result` then holds which of the two happened.
export function useBookingForm(initial: BookingFormInput) {
  const createBooking = useCreateBooking()
  const query = useQueryParams()
  const [result, setResult] = useState<CreateBookingResult | null>(null)
  const [error, setError] = useState<BookingError | null>(null)

  const form = useAppForm({
    defaultValues: initial,
    validators: { onChange: bookingFormSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        setResult(await createBooking.mutateAsync(toBookingPayload(value)))
        // The picks are done with: a refresh opens a fresh wizard instead of the old choices.
        query.clear()
      } catch (failure) {
        // The review step has no fields to hang a field error on, so every backend message ("The
        // child already has a booking at this time", "Insufficient wallet balance…") goes above
        // the buttons, word for word.
        setError({
          message: getErrorMessage(failure),
          status: isApiError(failure) ? failure.status : 0,
        })
      }
    },
  })

  function startOver() {
    form.reset(EMPTY_BOOKING_FORM)
    setResult(null)
    setError(null)
  }

  return { form, result, error, clearError: () => setError(null), startOver }
}

export type BookingFormApi = ReturnType<typeof useBookingForm>['form']
