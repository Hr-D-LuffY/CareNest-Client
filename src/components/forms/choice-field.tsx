'use client'

import { Check } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

export type ChoiceOption = {
  value: string
  label: string
  description?: string
}

type ChoiceFieldProps = {
  label: string
  options: readonly ChoiceOption[]
  hint?: string
  // The grid of cards from sm up. Three across by default; use fewer when the descriptions are long.
  columnsClassName?: string
}

// One choice out of a few, shown as cards (radio buttons underneath, so arrow keys and screen
// readers work as they should). The selected card carries a check mark as well as a colour.
export function ChoiceField({
  label,
  options,
  hint,
  columnsClassName = 'sm:grid-cols-3',
}: ChoiceFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={describedBy}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className={cn('grid gap-2', columnsClassName)}>
        {options.map((option) => {
          const checked = field.state.value === option.value
          return (
            <label
              key={option.value}
              className={cn(
                'relative flex min-h-16 cursor-pointer flex-col gap-0.5 rounded-xl border bg-card p-3 pr-8 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                checked ? 'border-cta bg-info-soft' : 'hover:bg-muted/60',
                error && !checked && 'border-destructive/50',
              )}
            >
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={checked}
                onChange={() => field.handleChange(option.value)}
                onBlur={field.handleBlur}
                className="sr-only"
              />
              <span className="text-sm font-semibold">{option.label}</span>
              {option.description && (
                <span className="text-xs text-muted-foreground">{option.description}</span>
              )}
              {checked && (
                <Check aria-hidden="true" className="absolute top-3 right-3 size-4 text-cta" />
              )}
            </label>
          )
        })}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </fieldset>
  )
}
