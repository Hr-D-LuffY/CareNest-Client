import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type FieldShellProps = {
  id: string
  label: string
  error: string | undefined
  // Marks a field the user may leave blank.
  optional?: boolean
  // Helper text that stays under the control (a rule, a format). Hidden while an error is shown.
  hint?: string
  children: ReactNode
}

// The `aria-describedby` for the control: the error when there is one, otherwise the hint.
export function getDescribedBy(id: string, error: string | undefined, hint: string | undefined) {
  if (error) return `${id}-error`
  return hint ? `${id}-hint` : undefined
}

// Label above the control, error (or hint) below it. The control wires aria-describedby with
// getDescribedBy().
export function FieldShell({ id, label, error, optional, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
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
    </div>
  )
}
