'use client'

import { Clock } from 'lucide-react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

// A time-of-day picker bound to the surrounding form field. The value is 24-hour "HH:mm", the same
// string the backend takes. It uses the browser's own time picker, which is keyboard and
// screen-reader friendly and has the right controls on phones.
export function TimeField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error}>
      <div className="relative">
        <Clock
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          name={field.name}
          type="time"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={getDescribedBy(id, error, undefined)}
          className="h-12 rounded-xl pl-11"
        />
      </div>
    </FieldShell>
  )
}
