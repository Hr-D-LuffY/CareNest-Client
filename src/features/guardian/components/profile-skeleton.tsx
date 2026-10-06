import { Skeleton } from '@/components/ui/skeleton'

const FIELD_IDS = ['name', 'email', 'phone', 'address'] as const

// The loading shape of the profile form: the photo card, then the details card. Also the page's
// loading.tsx body.
export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading your profile</span>
      <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-6 w-20 self-start" />
          <Skeleton className="size-36 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="flex flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-6 w-32" />
          {FIELD_IDS.map((id) => (
            <div key={id} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-12 w-56 self-end rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}
