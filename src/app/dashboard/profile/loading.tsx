import { Skeleton } from '@/components/ui/skeleton'
import { ProfileSkeleton } from '@/features/guardian/components/profile-skeleton'

// Same shape as the page: header, then the photo and details cards and the close-account card.
export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <ProfileSkeleton />
    </div>
  )
}
