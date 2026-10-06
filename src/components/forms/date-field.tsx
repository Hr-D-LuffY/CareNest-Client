'use client'

import { CalendarDays } from 'lucide-react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type DateFieldProps = {
  label: string
  // Latest allowed day, "YYYY-MM-DD". The browser's picker greys out later days.
  max?: string
  min?: string
  optional?: boolean
  hint?: string
}

// A calendar-day picker bound to the surrounding form field. The value is "YYYY-MM-DD", the same
// string the backend takes, so there is no time zone to get wrong. It uses the browser's own date
// picker, which is keyboard and screen-reader friendly and has the right keypad on phones.
export function DateField({ label, max, min, optional, hint }: DateFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error} optional={optional} hint={hint}>
      <div className="relative">
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          name={field.name}
          type="date"
          value={field.state.value}
          max={max}
          min={min}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={getDescribedBy(id, error, hint)}
          className="h-12 rounded-xl pl-11"
        />
      </div>
    </FieldShell>
  )
}
