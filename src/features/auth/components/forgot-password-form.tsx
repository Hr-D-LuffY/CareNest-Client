'use client'

import { ArrowLeft, Info, Mail } from 'lucide-react'
import Link from 'next/link'
import { useAppForm } from '@/hooks/use-app-form'
import { type ForgotPasswordInput, forgotPasswordSchema } from '../auth.schema'

// The first step of a password reset. The backend has no reset endpoint yet (⚠ A18 in AGENTS.md), so
// the email is validated like a real form but nothing can be sent: the button stays disabled and the
// notice says why. It must never claim that an email went out. When the endpoint exists, add an
// `onSubmit` that calls it and drop the notice and `disabled`.
export function ForgotPasswordForm() {
  const form = useAppForm({
    defaultValues: { email: '' } as ForgotPasswordInput,
    validators: { onChange: forgotPasswordSchema },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Pressing Enter in the field still checks the email, but nothing is sent.
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-start gap-2 rounded-xl border border-info/30 bg-info-soft p-3 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Password reset is not available yet. It is coming soon.</p>
      </div>

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

      <form.AppForm>
        <form.SubmitButton disabled>Send reset link</form.SubmitButton>
      </form.AppForm>

      <Link
        href="/login"
        className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to log in
      </Link>
    </form>
  )
}
