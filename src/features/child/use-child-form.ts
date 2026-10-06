'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { getErrorMessage } from '@/lib/api/errors'
import type { Child } from '@/types'
import { useCreateChild, useUpdateChild, useUploadChildPhoto } from './child.queries'
import {
  type ChildFormInput,
  childFormSchema,
  EMPTY_CHILD_FORM,
  toChildFormValues,
  toChildPayload,
} from './child.schema'

const FIELD_NAMES = [
  'name',
  'dateOfBirth',
  'tier',
  'allergies',
  'conditions',
  'emergencyContactName',
  'emergencyContactPhone',
] as const

// The add / edit child form, without any layout. Every design (side panel, step dialog, inline
// panel) calls this, so they validate, save and upload the same way: create or update the child,
// then upload the photo (the backend has a separate endpoint for it) with progress.
export function useChildForm(child: Child | null, onDone: () => void) {
  const createChild = useCreateChild()
  const updateChild = useUpdateChild()
  const uploadPhoto = useUploadChildPhoto()
  const { progress, report, reset } = useUploadProgress()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: (child ? toChildFormValues(child) : EMPTY_CHILD_FORM) as ChildFormInput,
    validators: { onChange: childFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)

      let saved: Child
      try {
        saved = child
          ? await updateChild.mutateAsync({
              id: child.id,
              payload: toChildPayload(value, 'update'),
            })
          : await createChild.mutateAsync(toChildPayload(value, 'create'))
      } catch (error) {
        // Field errors go under their field. Anything else (409, 429, offline) is shown above the button.
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES))
          setServerError(getErrorMessage(error))
        return
      }

      if (value.photo) {
        try {
          await uploadPhoto.mutateAsync({ id: saved.id, file: value.photo, onProgress: report })
        } catch (error) {
          reset()
          toast.error(
            `${saved.name} was saved, but the photo could not be uploaded: ${getErrorMessage(error)}`,
          )
          onDone()
          return
        }
      }

      toast.success(child ? `${saved.name} was updated.` : `${saved.name} was added.`)
      onDone()
    },
  })

  return { form, progress, serverError, isEdit: child !== null }
}

export type ChildFormApi = ReturnType<typeof useChildForm>['form']
