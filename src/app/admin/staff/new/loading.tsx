import { Skeleton } from '@/components/ui/skeleton'

export default function AddStaffLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading the form</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )
}
