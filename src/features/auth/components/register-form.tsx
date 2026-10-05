'use client'

import { CircleAlert, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { useRegisterMutation } from '../auth.queries'
import { type RegisterFormInput, registerFormSchema, toRegisterInput } from '../auth.schema'

const FIELD_NAMES = ['name', 'email', 'phone', 'address', 'password'] as const

const CONFLICT_STATUS = 409

export function RegisterForm({ redirect }: { redirect: string | undefined }) {
  const register = useRegisterMutation(redirect)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    } as RegisterFormInput,
    validators: { onChange: registerFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await register.mutateAsync(toRegisterInput(value))
      } catch (error) {
        // "An account with this email already exists" belongs under the email field. Field errors
        // from the backend go onto their field. Anything else is shown above the button.
        if (isApiError(error) && error.status === CONFLICT_STATUS) {
          setServerFieldError(formApi, 'email', error.message)
        } else if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
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

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
          />
        )}
      </form.AppField>

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
          <field.TextField
            label="Address"
            optional
            icon={MapPin}
            autoComplete="street-address"
            placeholder="House, road, area"
          />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`}
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
          />
        )}
      </form.AppField>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form.AppForm>
        <form.SubmitButton disabled={register.isSuccess}>Create account</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
