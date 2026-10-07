'use client'

import { FormError } from '@/components/forms/form-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DAY_LABEL } from '@/lib/constants'
import { type AvailabilitySlot, DAYS_OF_WEEK, type DayOfWeek } from '@/types'
import { useSlotForm } from '../use-slot-form'

const DAY_OPTIONS = DAYS_OF_WEEK.map((value) => ({ value, label: DAY_LABEL[value] }))

type SlotFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffId: string
  // The time being edited, or null to add a new one.
  slot: AvailabilitySlot | null
  // The weekday an "Add" button was pressed on, for a new time.
  defaultDay: DayOfWeek | null
}

// Add or edit a time in a modal. The form inside is mounted only while the modal is open, so every
// opening starts from the right values.
export function SlotFormDialog({
  open,
  onOpenChange,
  staffId,
  slot,
  defaultDay,
}: SlotFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SlotForm
          staffId={staffId}
          slot={slot}
          defaultDay={defaultDay}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function SlotForm({
  staffId,
  slot,
  defaultDay,
  onDone,
}: {
  staffId: string
  slot: AvailabilitySlot | null
  defaultDay: DayOfWeek | null
  onDone: () => void
}) {
  const { form, serverError } = useSlotForm(staffId, slot, defaultDay, onDone)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">
          {slot ? `Edit ${DAY_LABEL[slot.dayOfWeek]}` : 'Add a time'}
        </DialogTitle>
        <DialogDescription>
          The hours you can work on a weekday. Times on the same day cannot overlap.
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
          <form.AppField name="dayOfWeek">
            {(field) => (
              <field.ChoiceField
                label="Day"
                options={DAY_OPTIONS}
                columnsClassName="grid-cols-2 sm:grid-cols-4"
              />
            )}
          </form.AppField>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.AppField name="startTime">
              {(field) => <field.TimeField label="From" />}
            </form.AppField>
            <form.AppField name="endTime">
              {(field) => <field.TimeField label="Until" />}
            </form.AppField>
          </div>
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
                <form.SubmitButton>{slot ? 'Save changes' : 'Add time'}</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
