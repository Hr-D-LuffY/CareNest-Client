import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type FieldShellProps = {
  id: string
  label: string
  error: string | undefined
  children: ReactNode
}

// Label above the control, error message below it. The control wires aria-describedby to `${id}-error`.
export function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
