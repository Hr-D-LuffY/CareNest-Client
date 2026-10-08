'use client'

import { Clock, Timer } from 'lucide-react'
import { MAX_EXPERIENCE_YEARS } from '@/lib/constants'
import { needsHourlyRate, needsPerMinuteRate } from '../admin-staff.schema'
import { STAFF_TYPE_OPTIONS } from '../staff-type-options'
import type { StaffFormApi } from '../use-staff-form'

// Step 2: what the staff member does and how they are paid. The rate fields follow the type: a
// sitter is paid by the hour, a driver by the minute, and someone who does both needs both.
export function StaffDetailsStep({ form }: { form: StaffFormApi }) {
  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Role and rates
        </h2>
        <p className="text-sm text-muted-foreground">
          The rate decides what guardians are charged. You can change it later from the staff
          member&apos;s page.
        </p>
      </div>

      <form.AppField name="staffType">
        {(field) => <field.ChoiceField label="What will they do?" options={STAFF_TYPE_OPTIONS} />}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values.staffType}>
        {(staffType) => (
          <div className="grid gap-5 sm:grid-cols-2">
            {needsHourlyRate(staffType) && (
              <form.AppField name="hourlyRate">
                {(field) => (
                  <field.TextField
                    label="Hourly rate (BDT)"
                    icon={Clock}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="e.g. 250"
                    hint="Charged for the hours a child is in care."
                  />
                )}
              </form.AppField>
            )}
            {needsPerMinuteRate(staffType) && (
              <form.AppField name="perMinuteRate">
                {(field) => (
                  <field.TextField
                    label="Per-minute rate (BDT)"
                    icon={Timer}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="e.g. 5"
                    hint="Charged for the minutes of a ride."
                  />
                )}
              </form.AppField>
            )}
          </div>
        )}
      </form.Subscribe>

      <form.AppField name="experience">
        {(field) => (
          <field.TextField
            label="Years of experience"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            hint={`A whole number, 0 to ${MAX_EXPERIENCE_YEARS}.`}
          />
        )}
      </form.AppField>

      <form.AppField name="bio">
        {(field) => (
          <field.TextareaField
            label="About them"
            optional
            rows={4}
            placeholder="A few words guardians will read about this person"
          />
        )}
      </form.AppField>
    </section>
  )
}
