import { Skeleton } from '@/components/ui/skeleton'

const FACT_IDS = ['name', 'email', 'role', 'experience', 'rate', 'joined'] as const

// The loading shape of a profile page: the identity card on the left, the details on the right.
export function ProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <span className="sr-only">Loading your profile</span>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Skeleton className="h-24 rounded-none" />
        <div className="flex flex-col items-center gap-4 px-5 pb-6">
          <Skeleton className="-mt-[5.125rem] size-[164px] rounded-full ring-4 ring-card" />
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-52" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-5 sm:grid-cols-2">
          {FACT_IDS.map((id) => (
            <div key={id} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  )
}

// Same shape as the page: header, then the body. The loading.tsx of both profile pages.
export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32 md:h-9" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <ProfileSkeleton />
    </div>
  )
}
