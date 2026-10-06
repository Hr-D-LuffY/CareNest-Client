'use client'

import { useStore } from '@tanstack/react-form'
import { ArrowLeft, ArrowRight, Check, Hourglass, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { LAST_STEP, parseStep, resolveStep, type WizardStep } from '../booking.params'
import { type BookingFormInput, STEP_FIELDS, STEP_SCHEMAS } from '../booking.schema'
import { useBookingForm } from '../use-booking-form'
import { useReview } from '../use-review'
import { BookingResult } from './booking-result'
import { ChildStep } from './child-step'
import { ReviewStep } from './review-step'
import { RoomStep } from './room-step'
import { WizardProgress } from './wizard-progress'

type BookingWizardProps = {
  // The picks the page could confirm from the URL (a valid child, room and date), or empty strings.
  initial: BookingFormInput
}

// "Book a seat" in three steps: child, room and date, review. It is ONE form that stays mounted, so
// going back keeps every choice. The step lives in the URL (?step=), so the browser's Back button
// walks through the steps and a refresh keeps the place. Each step is checked on its own before
// "Next"; "Confirm" sends the booking, and the backend answers with a seat or a waitlist spot.
export function BookingWizard({ initial }: BookingWizardProps) {
  const query = useQueryParams()
  const { form, result, error, clearError, startOver } = useBookingForm(initial)
  const values = useStore(form.store, (state) => state.values)
  const review = useReview(values)

  // Never further than the first step that still needs an answer (a shared ?step=3 with no child).
  const step = resolveStep(parseStep(query.get('step')), values)

  // After a step change, move focus to the new step's heading so keyboard and screen-reader users
  // land on the new content instead of the old button.
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    document.getElementById('step-heading')?.focus()
  }, [step])

  function goTo(next: WizardStep) {
    clearError()
    // A step is a place in the history: Back returns to the previous one. Step 1 is the default.
    query.set({ step: next === 1 ? undefined : next }, { push: true })
  }

  // Checks only this step's answers. A failed check marks the step's fields touched, so their errors
  // show; a good one moves on.
  async function goNext() {
    for (const name of STEP_FIELDS[step]) {
      form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }))
    }
    await form.validate('change')
    if (STEP_SCHEMAS[step].safeParse(form.state.values).success && step < LAST_STEP) {
      goTo(step === 1 ? 2 : 3)
    }
  }

  if (result) {
    return <BookingResult result={result} onBookAnother={startOver} />
  }

  const canConfirm = review.isReady && review.hasRate && !review.insufficientBalance

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Book a seat</h1>
          <p className="text-muted-foreground">
            Choose a child, a room and a date. A full room never says no: your child joins a fair
            waitlist.
          </p>
        </header>
      </Reveal>

      <WizardProgress step={step} />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          // Enter inside a step means "Next"; only the last step sends the booking.
          if (step === LAST_STEP) form.handleSubmit()
          else goNext()
        }}
        className="flex flex-col gap-6 rounded-2xl border bg-card p-4 shadow-soft sm:p-6"
      >
        {step === 1 && <ChildStep form={form} />}
        {step === 2 && <RoomStep form={form} selected={review.selected} />}
        {step === 3 && <ReviewStep review={review} error={error} onEdit={goTo} />}

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl px-6"
              onClick={() => goTo(step === 3 ? 2 : 1)}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}

          {step < LAST_STEP ? (
            <Button
              type="submit"
              className="h-12 rounded-xl bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90"
            >
              Next
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={!canConfirm || isSubmitting}
                  className="h-12 rounded-xl bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : review.isFull ? (
                    <Hourglass aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  {review.isFull ? 'Join the waitlist' : 'Confirm booking'}
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>
      </form>
    </div>
  )
}
