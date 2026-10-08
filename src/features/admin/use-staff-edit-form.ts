'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import type { StaffProfile } from '@/types'
import { useUpdateStaff } from './admin-staff.queries'
import { staffEditSchema, toStaffChanges, toStaffEditValues } from './admin-staff.schema'

const FIELD_NAMES = [
  'name',
  'staffType',
  'experience',
  'bio',
  'hourlyRate',
  'perMinuteRate',
] as const

// The edit-staff form, without any layout. It sends only what changed, and refuses to send nothing
// (the backend wants at least one field).
export function useStaffEditForm(staff: StaffProfile, onDone: () => void) {
  const updateStaff = useUpdateStaff()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: toStaffEditValues(staff),
    validators: { onChange: staffEditSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)

      const changes = toStaffChanges(value, staff)
      if (Object.keys(changes).length === 0) {
        setServerError('Change at least one detail to save.')
        return
      }

      try {
        const saved = await updateStaff.mutateAsync({ id: staff.id, payload: changes })
        toast.success(`${saved.user.name} was updated.`)
        onDone()
      } catch (error) {
        // Field errors go under their field. Anything else (429, offline) is shown above the
        // button, word for word.
        if (mapServerFieldErrors(formApi, error, FIELD_NAMES)) return
        setServerError(getErrorMessage(error))
      }
    },
  })

  return { form, serverError }
}

export type StaffEditFormApi = ReturnType<typeof useStaffEditForm>['form']
