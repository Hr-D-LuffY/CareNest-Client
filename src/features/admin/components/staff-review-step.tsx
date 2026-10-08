'use client'

import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { FormError } from '@/components/forms/form-error'
import { Button } from '@/components/ui/button'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT } from '@/lib/format'
import { needsHourlyRate, needsPerMinuteRate, type StaffFormInput } from '../admin-staff.schema'
import type { StaffWizardStep } from '../staff-wizard.params'

function Row({
  label,
  children,
  onChange,
}: {
  label: string
  children: ReactNode
  onChange?: () => void
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
            <span className="sr-only"> {label.toLowerCase()}</span>
          </Button>
        )}
      </dd>
    </div>
  )
}

type StaffReviewStepProps = {
  values: StaffFormInput
  error: string | null
  onEdit: (step: StaffWizardStep) => void
}

// Step 3: everything the admin is about to create, with a "Change" link back to the step that owns
// each answer. Nothing is sent until "Create account" below. The password is never shown.
export function StaffReviewStep({ values, error, onEdit }: StaffReviewStepProps) {
  const bio = values.bio.trim()
  const years = Number(values.experience)

  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Review the account
        </h2>
        <p className="text-sm text-muted-foreground">
          Check the details. Nothing is created until you confirm.
        </p>
      </div>

      <dl className="flex flex-col divide-y rounded-2xl border bg-card px-5">
        <Row label="Name" onChange={() => onEdit(1)}>
          {values.name.trim()}
        </Row>
        <Row label="Email" onChange={() => onEdit(1)}>
          <span className="break-all">{values.email.trim().toLowerCase()}</span>
        </Row>
        <Row label="Password" onChange={() => onEdit(1)}>
          <span>
            <span aria-hidden="true">{'*'.repeat(Math.min(values.password.length, 12))}</span>
            <span className="sr-only">{values.password.length} characters, hidden</span>
          </span>
        </Row>
        <Row label="Role" onChange={() => onEdit(2)}>
          {STAFF_TYPE_LABEL[values.staffType]}
        </Row>
        {needsHourlyRate(values.staffType) && (
          <Row label="Hourly rate" onChange={() => onEdit(2)}>
            <span className="tabular-nums">{formatBDT(values.hourlyRate.trim())} per hour</span>
          </Row>
        )}
        {needsPerMinuteRate(values.staffType) && (
          <Row label="Per-minute rate" onChange={() => onEdit(2)}>
            <span className="tabular-nums">
              {formatBDT(values.perMinuteRate.trim())} per minute
            </span>
          </Row>
        )}
        <Row label="Experience" onChange={() => onEdit(2)}>
          <span className="tabular-nums">
            {years} {years === 1 ? 'year' : 'years'}
          </span>
        </Row>
        <Row label="About them" onChange={() => onEdit(2)}>
          {bio || <span className="text-muted-foreground">Nothing written</span>}
        </Row>
      </dl>

      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-linear-to-br from-warning-soft via-card to-card p-4 text-sm">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
        <p>
          The account starts <span className="font-semibold">unverified</span>. They can sign in and
          fill in their profile, but cannot take bookings or trips until you verify them.
        </p>
      </div>

      <FormError message={error} />
    </section>
  )
}
