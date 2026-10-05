'use client'

import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type TextFieldProps = {
  label: string
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  icon?: LucideIcon
}

// Text input with an optional leading icon, bound to the surrounding form field.
export function TextField({
  label,
  type = 'text',
  placeholder,
  autoComplete,
  icon: Icon,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error}>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
          />
        )}
        <Input
          id={id}
          name={field.name}
          type={type}
          value={field.state.value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={Icon ? 'h-12 rounded-xl pl-11' : 'h-12 rounded-xl'}
        />
      </div>
    </FieldShell>
  )
}
