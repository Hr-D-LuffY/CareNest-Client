'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { DAY_LABEL } from '@/lib/constants'
import type { AvailabilitySlot, DayOfWeek } from '@/types'
import {
  EMPTY_SLOT_FORM,
  type SlotFormInput,
  slotFormSchema,
  toSlotChanges,
  toSlotFormValues,
} from './slot.schema'
import { useCreateSlot, useUpdateSlot } from './staff.queries'

const FIELD_NAMES = ['dayOfWeek', 'startTime', 'endTime'] as const

// The add / edit availability form, without any layout. Adding sends every field. Editing sends only
// what changed, and refuses to send nothing (the backend wants at least one field). `defaultDay` is
// the weekday an "Add" button was pressed on.
export function useSlotForm(
  staffId: string,
  slot: AvailabilitySlot | null,
  defaultDay: DayOfWeek | null,
  onDone: () => void,
) {
  const createSlot = useCreateSlot(staffId)
  const updateSlot = useUpdateSlot(staffId)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: (slot
      ? toSlotFormValues(slot)
      : { ...EMPTY_SLOT_FORM, ...(defaultDay && { dayOfWeek: defaultDay }) }) as SlotFormInput,
    validators: { onChange: slotFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)

      try {
        if (slot) {
          const changes = toSlotChanges(value, slot)
          if (Object.keys(changes).length === 0) {
            setServerError('Change at least one detail to save.')
            return
          }
          await updateSlot.mutateAsync({ id: slot.id, payload: changes })
          toast.success(`${DAY_LABEL[value.dayOfWeek]} was updated.`)
        } else {
          await createSlot.mutateAsync(value)
          toast.success(`${DAY_LABEL[value.dayOfWeek]} was added.`)
        }
        onDone()
      } catch (error) {
        // Field errors go under their field. Anything else (a 409 for a time that overlaps another
        // one, 429, offline) is shown above the button, word for word.
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return { form, serverError }
}
