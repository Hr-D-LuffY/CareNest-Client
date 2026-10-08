'use client'

import { Clock, Timer, UserRound } from 'lucide-react'
import { FormError } from '@/components/forms/form-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAX_EXPERIENCE_YEARS } from '@/lib/constants'
import type { StaffProfile } from '@/types'
import { needsHourlyRate, needsPerMinuteRate } from '../admin-staff.schema'
import { STAFF_TYPE_OPTIONS } from '../staff-type-options'
import { useStaffEditForm } from '../use-staff-edit-form'

type StaffEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffProfile
}

// Edit a staff member in a modal: name, role, rates, experience and bio. The email is their login
// and verification has its own buttons, so neither is here. The form inside is mounted only while
// the modal is open, so every opening starts from what is saved.
export function StaffEditDialog({ open, onOpenChange, staff }: StaffEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <EditForm staff={staff} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditForm({ staff, onDone }: { staff: StaffProfile; onDone: () => void }) {
  const { form, serverError } = useStaffEditForm(staff, onDone)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">Edit {staff.user.name}</DialogTitle>
        <DialogDescription>
          Their email is their login, so it cannot be changed here. Verification has its own
          buttons.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Full name"
                icon={UserRound}
                autoComplete="off"
                placeholder="Their full name"
              />
            )}
          </form.AppField>

          <form.AppField name="staffType">
            {(field) => <field.ChoiceField label="Role" options={STAFF_TYPE_OPTIONS} />}
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
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:p-6">
          <FormError message={serverError} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl px-6"
              onClick={onDone}
            >
              Cancel
            </Button>
            <div className="sm:w-56">
              <form.AppForm>
                <form.SubmitButton>Save changes</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
