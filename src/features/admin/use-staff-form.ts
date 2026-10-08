'use client'

import { useState } from 'react'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { useQueryParams } from '@/hooks/use-query-params'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import type { StaffProfile } from '@/types'
import { useCreateStaff } from './admin-staff.queries'
import {
  EMPTY_STAFF_FORM,
  STAFF_STEP_FIELDS,
  staffFormSchema,
  toCreateStaffPayload,
} from './admin-staff.schema'

const CONFLICT_STATUS = 409

// The create-staff wizard as ONE form: it stays mounted while the admin moves between steps, so going
// back keeps every answer. Submitting creates the account; `created` then holds the new profile.
export function useStaffForm() {
  const createStaff = useCreateStaff()
  const query = useQueryParams()
  const [created, setCreated] = useState<StaffProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: EMPTY_STAFF_FORM,
    validators: { onChange: staffFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        setCreated(await createStaff.mutateAsync(toCreateStaffPayload(value)))
        // The answers are done with: a refresh opens a fresh wizard.
        query.clear()
      } catch (failure) {
        // "An account with this email already exists" belongs under the email field, and field
        // errors from the backend under theirs. The admin is taken back to the step that has the
        // problem. Anything else (429, offline) is shown above the buttons, word for word.
        if (isApiError(failure) && failure.status === CONFLICT_STATUS) {
          setServerFieldError(formApi, 'email', failure.message)
          query.set({ step: undefined }, { push: true })
          return
        }
        const fieldNames = STAFF_STEP_FIELDS[3]
        if (mapServerFieldErrors(formApi, failure, fieldNames)) {
          const inAccountStep = STAFF_STEP_FIELDS[1].some(
            (name) => isApiError(failure) && failure.fieldErrors[name],
          )
          query.set({ step: inAccountStep ? undefined : 2 }, { push: true })
          return
        }
        setError(getErrorMessage(failure))
      }
    },
  })

  function startOver() {
    form.reset(EMPTY_STAFF_FORM)
    setCreated(null)
    setError(null)
  }

  return { form, created, error, clearError: () => setError(null), startOver }
}

export type StaffFormApi = ReturnType<typeof useStaffForm>['form']
