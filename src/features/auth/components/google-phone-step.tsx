'use client'

import { Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { useGoogleLoginMutation } from '../auth.queries'
import { type GooglePhoneInput, googlePhoneSchema } from '../auth.schema'

type GooglePhoneStepProps = {
  idToken: string
  redirect: string | undefined
  onCancel: () => void
}

// First time this Google account signs in: the backend creates a guardian account and a guardian
// profile needs a phone number. This is the one field Google cannot supply.
export function GooglePhoneStep({ idToken, redirect, onCancel }: GooglePhoneStepProps) {
  const google = useGoogleLoginMutation(redirect)

  const form = useAppForm({
    defaultValues: { phone: '' } as GooglePhoneInput,
    validators: { onChange: googlePhoneSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await google.mutateAsync({ idToken, phone: value.phone.trim() })
      } catch (error) {
        const phoneError = isApiError(error) ? error.fieldErrors.phone : undefined
        if (phoneError) {
          formApi.setFieldMeta('phone', (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: phoneError },
          }))
        } else {
          toast.error(getErrorMessage(error))
        }
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
      className="flex flex-col gap-5"
    >
      <div>
        <h2 className="text-xl">One last step</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is your first time with Google. Add a phone number to finish creating your guardian
          account.
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

      <form.AppForm>
        <form.SubmitButton disabled={google.isSuccess}>Create account</form.SubmitButton>
      </form.AppForm>
      <Button type="button" variant="ghost" onClick={onCancel} className="h-11 w-full rounded-xl">
        Back to log in
      </Button>
    </form>
  )
}
