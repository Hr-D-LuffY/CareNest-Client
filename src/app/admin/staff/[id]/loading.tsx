import { Skeleton } from '@/components/ui/skeleton'
import { StaffDetailSkeleton } from '@/features/admin/components/staff-detail-skeleton'

export default function AdminStaffDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>
      <StaffDetailSkeleton />
    </div>
  )
}
