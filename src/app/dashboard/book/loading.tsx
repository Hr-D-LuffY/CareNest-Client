import { Skeleton } from '@/components/ui/skeleton'

const STEP_IDS = ['child', 'room', 'review'] as const
const CHOICE_IDS = ['a', 'b', 'c'] as const

// Same shape as the wizard: header, the three-step progress bar, then the first step in its card.
export default function BookLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {STEP_IDS.map((id) => (
          <div key={id} className="flex flex-col gap-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {CHOICE_IDS.map((id) => (
            <Skeleton key={id} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="flex justify-end border-t pt-4">
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
