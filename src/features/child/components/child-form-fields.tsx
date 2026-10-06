'use client'

import { CircleAlert, Phone, UserRound } from 'lucide-react'
import { TIER_LABEL } from '@/lib/constants'
import { todayIso } from '@/lib/format'
import { Tier } from '@/types'
import type { ChildFormApi } from '../use-child-form'

// The form's fields, one component each, so every design lays out the same fields its own way.
// They all take the form from useChildForm().

// What each tier means, in the words of the /services page.
const TIER_OPTIONS = [
  { value: Tier.DAILY, label: TIER_LABEL.DAILY, description: 'Day-by-day care' },
  { value: Tier.WEEKLY, label: TIER_LABEL.WEEKLY, description: 'A standing weekly place' },
  { value: Tier.MONTHLY, label: TIER_LABEL.MONTHLY, description: 'The longest commitment' },
] as const

type FieldProps = { form: ChildFormApi }

export function PhotoFormField({
  form,
  currentPhoto,
  progress,
  size,
  stacked,
}: FieldProps & {
  currentPhoto?: string | null
  progress: number | null
  size?: number
  stacked?: boolean
}) {
  return (
    <form.Subscribe selector={(state) => state.values.name}>
      {(name) => (
        <form.AppField name="photo">
          {(field) => (
            <field.ImageField
              label="Photo"
              name={name}
              currentPhoto={currentPhoto}
              progress={progress}
              size={size}
              stacked={stacked}
            />
          )}
        </form.AppField>
      )}
    </form.Subscribe>
  )
}

export function NameField({ form }: FieldProps) {
  return (
    <form.AppField name="name">
      {(field) => (
        <field.TextField
          label="Full name"
          icon={UserRound}
          autoComplete="off"
          placeholder="Your child's full name"
        />
      )}
    </form.AppField>
  )
}

export function DateOfBirthField({ form }: FieldProps) {
  return (
    <form.AppField name="dateOfBirth">
      {(field) => <field.DateField label="Date of birth" max={todayIso()} />}
    </form.AppField>
  )
}

export function TierField({ form }: FieldProps) {
  return (
    <form.AppField name="tier">
      {(field) => (
        <field.ChoiceField
          label="Care tier"
          options={TIER_OPTIONS}
          hint="Also sets waitlist priority: Monthly ranks above Weekly, and Weekly above Daily."
        />
      )}
    </form.AppField>
  )
}

export function AllergiesField({ form }: FieldProps) {
  return (
    <form.AppField name="allergies">
      {(field) => (
        <field.TextareaField
          label="Allergies"
          optional
          rows={2}
          placeholder="Foods, medicines, insect stings"
        />
      )}
    </form.AppField>
  )
}

export function ConditionsField({ form }: FieldProps) {
  return (
    <form.AppField name="conditions">
      {(field) => (
        <field.TextareaField
          label="Medical conditions"
          optional
          rows={2}
          placeholder="Asthma, diabetes, anything staff should know"
        />
      )}
    </form.AppField>
  )
}

export function EmergencyNameField({ form }: FieldProps) {
  return (
    <form.AppField name="emergencyContactName">
      {(field) => (
        <field.TextField
          label="Contact name"
          icon={UserRound}
          autoComplete="off"
          placeholder="Who should staff call?"
        />
      )}
    </form.AppField>
  )
}

export function EmergencyPhoneField({ form }: FieldProps) {
  return (
    <form.AppField name="emergencyContactPhone">
      {(field) => (
        <field.TextField
          label="Contact phone"
          type="tel"
          icon={Phone}
          autoComplete="off"
          placeholder="01XXXXXXXXX"
        />
      )}
    </form.AppField>
  )
}

// A failure that does not belong to one field (409, 429, offline), shown above the submit button.
export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      {message}
    </div>
  )
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

export function childFormTitle(childName: string | undefined) {
  return childName ? `Edit ${childName}` : 'Add a child'
}
