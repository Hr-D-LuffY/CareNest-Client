import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

// A dashboard section whose data could not be fetched. The rest of the page still works, so this
// says what is missing and how to recover instead of leaving a hole.
export function SectionError({ title, className }: { title: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm',
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
      <p>
        <span className="font-semibold">{title}</span> could not be loaded. Refresh the page to try
        again. If the server was asleep, it can take up to a minute to wake.
      </p>
    </div>
  )
}
