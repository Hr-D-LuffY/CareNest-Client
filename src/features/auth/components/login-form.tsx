'use client'

import { CircleAlert, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { useLoginMutation } from '../auth.queries'
import { type LoginInput, loginSchema } from '../auth.schema'
import type { DemoRole } from '../demo-roles'
import { DemoLogin } from './demo-login'
import { GooglePhoneStep } from './google-phone-step'
import { GoogleSignIn } from './google-sign-in'
import { OrDivider } from './or-divider'

type LoginFormProps = {
  redirect: string | undefined
  demoRoles: readonly DemoRole[]
  // Blank when Google sign-in is not configured: the Google button is then not shown at all.
  googleClientId: string | undefined
}

const FIELD_NAMES = ['email', 'password'] as const

export function LoginForm({ redirect, demoRoles, googleClientId }: LoginFormProps) {
  const login = useLoginMutation(redirect)
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '', password: '' } as LoginInput,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await login.mutateAsync(value)
      } catch (error) {
        // Field errors from the backend go onto their field. Anything else ("Invalid email or
        // password", rate limit, server asleep) is shown above the button.
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  if (googleIdToken) {
    return (
      <GooglePhoneStep
        idToken={googleIdToken}
        redirect={redirect}
        onCancel={() => setGoogleIdToken(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-5"
      >
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

        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
            />
          )}
        </form.AppField>

        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded-sm text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Forgot password?
          </Link>
        </div>

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
          <form.SubmitButton disabled={login.isSuccess}>Continue</form.SubmitButton>
        </form.AppForm>
      </form>

      {googleClientId && (
        <>
          <OrDivider label="Or" />
          <GoogleSignIn
            clientId={googleClientId}
            redirect={redirect}
            onNeedsPhone={setGoogleIdToken}
          />
        </>
      )}

      <DemoLogin availableRoles={demoRoles} redirect={redirect} />
    </div>
  )
}
