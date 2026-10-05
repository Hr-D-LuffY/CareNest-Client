'use client'

import { Eye, EyeOff, Lock } from 'lucide-react'
import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type PasswordFieldProps = {
  label: string
  placeholder?: string
  // "current-password" on login, "new-password" on sign-up: lets password managers do the right thing.
  autoComplete: 'current-password' | 'new-password'
}

export function PasswordField({ label, placeholder, autoComplete }: PasswordFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const [visible, setVisible] = useState(false)
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error}>
      <div className="relative">
        <Lock
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          name={field.name}
          type={visible ? 'text' : 'password'}
          value={field.state.value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12 rounded-xl pr-12 pl-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </FieldShell>
  )
}
