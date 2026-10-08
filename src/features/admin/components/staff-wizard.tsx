'use client'

import { useStore } from '@tanstack/react-form'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { WizardProgress } from '@/components/shared/wizard-progress'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { SOFT_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'
import { STAFF_STEP_FIELDS, STAFF_STEP_SCHEMAS } from '../admin-staff.schema'
import {
  LAST_STAFF_STEP,
  parseStaffStep,
  resolveStaffStep,
  STAFF_WIZARD_STEPS,
  type StaffWizardStep,
} from '../staff-wizard.params'
import { useStaffForm } from '../use-staff-form'
import { StaffAccountStep } from './staff-account-step'
import { StaffCreated } from './staff-created'
import { StaffDetailsStep } from './staff-details-step'
import { StaffReviewStep } from './staff-review-step'

// "Add staff" in three steps: account, role and rates, review. It is ONE form that stays mounted, so
// going back keeps every answer. The step lives in the URL (?step=), so the browser's Back button
// walks through the steps. Each step is checked on its own before "Next"; "Create account" sends it.
export function StaffWizard() {
  const query = useQueryParams()
  const { form, created, error, clearError, startOver } = useStaffForm()
  const values = useStore(form.store, (state) => state.values)

  // Never further than the first step that still needs an answer (a reload on ?step=3).
  const step = resolveStaffStep(parseStaffStep(query.get('step')), values)

  // After a step change, move focus to the new step's heading so keyboard and screen-reader users
  // land on the new content instead of the old button.
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    document.getElementById('step-heading')?.focus()
  }, [step])

  function goTo(next: StaffWizardStep) {
    clearError()
    // A step is a place in the history: Back returns to the previous one. Step 1 is the default.
    query.set({ step: next === 1 ? undefined : next }, { push: true })
  }

  // Checks only this step's answers. A failed check marks the step's fields touched, so their errors
  // show; a good one moves on.
  async function goNext() {
    for (const name of STAFF_STEP_FIELDS[step]) {
      form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }))
    }
    await form.validate('change')
    if (STAFF_STEP_SCHEMAS[step].safeParse(form.state.values).success && step < LAST_STAFF_STEP) {
      goTo(step === 1 ? 2 : 3)
    }
  }

  if (created) {
    return <StaffCreated staff={created} onAddAnother={startOver} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className={cn(SOFT_SURFACE, 'flex flex-col gap-2 rounded-2xl p-5 sm:p-6')}>
          <Link
            href="/admin/staff"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All staff
          </Link>
          <h1 className="text-2xl text-balance md:text-3xl">Add staff</h1>
          <p className="text-muted-foreground">
            Create a sitter or driver account. Staff cannot sign up on their own.
          </p>
        </header>
      </Reveal>

      <WizardProgress steps={STAFF_WIZARD_STEPS} step={step} label="Add staff progress" />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          // Enter inside a step means "Next"; only the last step creates the account.
          if (step === LAST_STAFF_STEP) form.handleSubmit()
          else goNext()
        }}
        className="flex flex-col gap-6 rounded-2xl border bg-card p-4 shadow-soft sm:p-6"
      >
        {step === 1 && <StaffAccountStep form={form} />}
        {step === 2 && <StaffDetailsStep form={form} />}
        {step === 3 && <StaffReviewStep values={values} error={error} onEdit={goTo} />}

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
            <Link
              href="/admin/staff"
              className={cn(buttonVariants({ variant: 'ghost' }), 'h-12 rounded-xl px-6')}
            >
              Cancel
            </Link>
          )}

          {step < LAST_STAFF_STEP ? (
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
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  Create account
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>
      </form>
    </div>
  )
}
