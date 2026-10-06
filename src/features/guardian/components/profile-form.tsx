'use client'

import { Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSyncSession } from '@/features/auth/auth.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { getErrorMessage } from '@/lib/api/errors'
import type { GuardianProfile } from '@/types'
import { useUpdateGuardian, useUploadGuardianPhoto } from '../guardian.queries'
import {
  hasProfileChanges,
  type ProfileFormInput,
  profileFormSchema,
  toProfileFormValues,
  toProfilePayload,
} from '../guardian.schema'

const FIELD_NAMES = ['name', 'phone', 'address'] as const

// The guardian's own details: photo, name, phone and address. Email is shown but cannot be changed
// (it is the login). Saving sends only the fields that changed, then uploads the photo (a separate
// backend endpoint, with a progress bar), then refreshes the session so the top bar shows the new
// name and photo.
export function ProfileForm({ profile }: { profile: GuardianProfile }) {
  const updateProfile = useUpdateGuardian()
  const uploadPhoto = useUploadGuardianPhoto()
  const syncSession = useSyncSession()
  const { progress, report, reset } = useUploadProgress()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: toProfileFormValues(profile) as ProfileFormInput,
    validators: { onChange: profileFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      let latest = profile

      const payload = toProfilePayload(value, profile)
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

      // The saved profile is the form's new starting point. A photo that failed stays chosen, so
      // the guardian can try again without picking it twice.
      formApi.reset({ ...toProfileFormValues(latest), photo: photoError ? value.photo : null })

      if (photoError) {
        toast.error(`Your details were saved, but the photo could not be uploaded: ${photoError}`)
      } else {
        toast.success('Profile updated.')
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Photo</CardTitle>
          <CardDescription>
            Shown in the top bar and to the staff who care for your child.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Subscribe selector={(state) => state.values.name}>
            {(name) => (
              <form.AppField name="photo">
                {(field) => (
                  <field.ImageField
                    label="Profile photo"
                    name={name}
                    currentPhoto={profile.profilePhoto}
                    progress={progress}
                    size={144}
                    stacked
                  />
                )}
              </form.AppField>
            )}
          </form.Subscribe>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Your details</CardTitle>
          <CardDescription>
            Staff and CareNest use these to reach you about a session.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email" className="text-sm">
              Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={profile.email}
              readOnly
              aria-describedby="profile-email-hint"
              className="h-12 rounded-xl bg-muted/60"
            />
            <p id="profile-email-hint" className="text-sm text-muted-foreground">
              Your email is how you sign in, so it cannot be changed here.
            </p>
          </div>

          <form.AppField name="phone">
            {(field) => (
              <field.TextField
                label="Phone"
                type="tel"
                icon={Phone}
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
              />
            )}
          </form.AppField>

          <form.AppField name="address">
            {(field) => (
              <field.TextareaField
                label="Address"
                optional
                rows={3}
                placeholder="House, road, area"
                hint="Leave it empty to remove your address."
              />
            )}
          </form.AppField>

          <FormError message={serverError} />

          <div className="flex justify-end">
            <div className="w-full sm:w-56">
              <form.Subscribe selector={(state) => hasProfileChanges(state.values, profile)}>
                {(changed) => (
                  <form.AppForm>
                    <form.SubmitButton disabled={!changed}>Save changes</form.SubmitButton>
                  </form.AppForm>
                )}
              </form.Subscribe>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
