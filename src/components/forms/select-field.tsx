'use client'

import { useId } from 'react'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

export type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  label: string
  options: readonly SelectOption[]
  // The empty first choice ("Choose a sitter"). Leave out when the field always has a value.
  placeholder?: string
  disabled?: boolean
  optional?: boolean
  hint?: string
}

// One choice out of a longer list (a weekday, a sitter), bound to the surrounding form field. A
// native <select>, so it is keyboard and screen-reader friendly and gets the right picker on phones.
export function SelectField({
  label,
  options,
  placeholder,
  disabled,
  optional,
  hint,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error} optional={optional} hint={hint}>
      <select
        id={id}
        name={field.name}
        value={field.state.value}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={getDescribedBy(id, error, hint)}
        className="h-12 w-full cursor-pointer rounded-xl border border-input bg-transparent px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
      >
        {placeholder !== undefined && (
          <option value="" className="bg-popover text-popover-foreground">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-popover text-popover-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
