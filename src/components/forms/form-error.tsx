import { CircleAlert } from 'lucide-react'

// A failure that does not belong to one field (409, 429, offline), shown above the submit button.
// role="alert" so a screen reader announces it. Plain markup with no hooks.
export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      {message}
    </div>
  )
}
