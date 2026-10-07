'use client'

import { Briefcase, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { ReadOnlyEmail } from '@/components/forms/read-only-email'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { Button } from '@/components/ui/button'
import { useSyncSession } from '@/features/auth/auth.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { getErrorMessage } from '@/lib/api/errors'
import { MAX_EXPERIENCE_YEARS } from '@/lib/constants'
import type { StaffProfile } from '@/types'
import { useUpdateStaffProfile, useUploadStaffPhoto } from '../staff.queries'
import {
  hasStaffProfileChanges,
  type StaffProfileFormInput,
  staffProfileFormSchema,
  toStaffProfilePayload,
  toStaffProfileValues,
} from '../staff.schema'

const FIELD_NAMES = ['name', 'bio', 'experience'] as const

type MyProfileFormProps = {
  profile: StaffProfile
  // Called after a save, and when the staff member cancels: the page goes back to the read-only view.
  onDone: () => void
}

// The staff member's own details: photo, name, bio and years of experience. Email is shown but
// cannot be changed (it is the login). Saving sends only the fields that changed, then uploads the
// photo (a separate backend endpoint, with a progress bar), then refreshes the session so the top bar
// shows the new name and photo. It is mounted only while editing, so every edit starts from what is
// saved.
export function MyProfileForm({ profile, onDone }: MyProfileFormProps) {
  const updateProfile = useUpdateStaffProfile()
  const uploadPhoto = useUploadStaffPhoto()
  const syncSession = useSyncSession()
  const { progress, report, reset } = useUploadProgress()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: toStaffProfileValues(profile) as StaffProfileFormInput,
    validators: { onChange: staffProfileFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      let latest = profile

      const payload = toStaffProfilePayload(value, profile)
      if (Object.keys(payload).length > 0) {
        try {
          latest = await updateProfile.mutateAsync(payload)
        } catch (error) {
          // Field errors go under their field. Anything else (429, offline) is shown above the button.
          if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
            setServerError(getErrorMessage(error))
          }
          return
        }
      }

      let photoError: string | null = null
      if (value.photo) {
        try {
          latest = await uploadPhoto.mutateAsync({ file: value.photo, onProgress: report })
        } catch (error) {
          reset()
          photoError = getErrorMessage(error)
        }
      }

      // The new name and photo reach the top bar. If this fails, the edit is still saved.
      syncSession.mutate()

      if (photoError) {
        // The details are saved, so they are the form's new starting point. The photo that failed
        // stays chosen, so it can be tried again without picking it twice.
        formApi.reset({ ...toStaffProfileValues(latest), photo: value.photo })
        setServerError(
          `Your details were saved, but the photo could not be uploaded: ${photoError}`,
        )
        return
      }

      toast.success('Profile updated.')
      onDone()
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <form.Subscribe selector={(state) => state.values.name}>
        {(name) => (
          <form.AppField name="photo">
            {(field) => (
              <field.ImageField
                label="Profile photo"
                name={name}
                currentPhoto={profile.user.profilePhoto}
                progress={progress}
                size={96}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>

      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Full name"
            icon={UserRound}
            autoComplete="name"
            placeholder="Your full name"
          />
        )}
      </form.AppField>

      <ReadOnlyEmail id="staff-email" email={profile.user.email} />

      <form.AppField name="experience">
        {(field) => (
          <field.TextField
            label="Years of experience"
            icon={Briefcase}
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 3"
            hint={`A whole number, from 0 to ${MAX_EXPERIENCE_YEARS}.`}
          />
        )}
      </form.AppField>

      <form.AppField name="bio">
        {(field) => (
          <field.TextareaField
            label="About you"
            optional
            rows={4}
            placeholder="Training, the ages you enjoy working with, anything you would like known"
            hint="Leave it empty to remove it."
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-12 rounded-xl px-6" onClick={onDone}>
          Cancel
        </Button>
        <div className="sm:w-56">
          <form.Subscribe selector={(state) => hasStaffProfileChanges(state.values, profile)}>
            {(changed) => (
              <form.AppForm>
                <form.SubmitButton disabled={!changed}>Save changes</form.SubmitButton>
              </form.AppForm>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
