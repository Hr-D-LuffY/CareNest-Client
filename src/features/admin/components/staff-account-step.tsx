'use client'

import { Mail, UserRound } from 'lucide-react'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import type { StaffFormApi } from '../use-staff-form'

// Step 1: the login the new staff member will use. Staff do not sign up themselves: an admin creates
// the account and sets the first password.
export function StaffAccountStep({ form }: { form: StaffFormApi }) {
  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Their account
        </h2>
        <p className="text-sm text-muted-foreground">
          The name and email the staff member signs in with. Their email is the login, so it cannot
          be changed later.
        </p>
      </div>

      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Full name"
            icon={UserRound}
            autoComplete="off"
            placeholder="Their full name"
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="off"
            placeholder="name@example.com"
          />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.PasswordField
            label="First password"
            autoComplete="new-password"
            placeholder="Choose a password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters. Share it with them securely: they sign in with it right away.`}
          />
        )}
      </form.AppField>
    </section>
  )
}
