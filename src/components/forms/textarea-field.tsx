'use client'

import { useId } from 'react'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type TextareaFieldProps = {
  label: string
  placeholder?: string
  rows?: number
  maxLength?: number
  optional?: boolean
  hint?: string
}

// Multi-line input bound to the surrounding form field. Same look as TextField.
export function TextareaField({
  label,
  placeholder,
  rows = 6,
  maxLength,
  optional,
  hint,
}: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error} optional={optional} hint={hint}>
      <textarea
        id={id}
        name={field.name}
        value={field.state.value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={getDescribedBy(id, error, hint)}
        className="min-h-32 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
      />
    </FieldShell>
  )
}
