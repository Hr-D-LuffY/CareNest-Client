'use client'

import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type TextFieldProps = {
  label: string
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  // Picks the mobile keyboard (a number pad for an amount) without the quirks of type="number".
  inputMode?: 'text' | 'numeric' | 'decimal'
  icon?: LucideIcon
  optional?: boolean
  hint?: string
}

// Text input with an optional leading icon, bound to the surrounding form field.
export function TextField({
  label,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  icon: Icon,
  optional,
  hint,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error} optional={optional} hint={hint}>
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
          inputMode={inputMode}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={getDescribedBy(id, error, hint)}
          className={Icon ? 'h-12 rounded-xl pl-11' : 'h-12 rounded-xl'}
        />
      </div>
    </FieldShell>
  )
}
