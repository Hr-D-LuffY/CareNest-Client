'use client'

import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { ProfileIdentityCard } from '@/components/shared/profile-identity-card'
import { ProfileSkeleton } from '@/components/shared/profile-skeleton'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { VerificationStatus } from '@/types'
import { useStaffProfileQuery } from '../staff.queries'
import { MyProfileDetails } from './my-profile-details'
import { VerificationCard } from './verification-card'

// The staff member's profile page, laid out like the guardian's: who they are on the left (a large
// picture, name and badges), their details on the right to read first and edit on request, and the
// credentials upload under the picture while they are not verified. Availability has its own page.
// The server page has already prefetched the profile, so this normally renders with data; if that
// failed, it shows a retry instead of an empty page.
export function MyProfileView() {
  const { data, isPending, isError, refetch } = useStaffProfileQuery()

  function renderBody() {
    if (isPending) return <ProfileSkeleton />
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />

    // Verified staff never see the upload: there is nothing left to review.
    const needsCredentials = data.verificationStatus !== VerificationStatus.VERIFIED

    return (
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ProfileIdentityCard
          name={data.user.name}
          email={data.user.email}
          photo={data.user.profilePhoto}
          badges={
            <>
              <Badge variant="secondary" className="h-6 bg-info-soft px-2.5 text-info">
                {STAFF_TYPE_LABEL[data.staffType]}
              </Badge>
              <StatusBadge kind="verification" status={data.verificationStatus} />
            </>
          }
        />
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <MyProfileDetails profile={data} />
        </div>
        {needsCredentials && (
          <div className="lg:col-start-1 lg:row-start-2">
            <VerificationCard profile={data} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Profile</h1>
          <p className="text-muted-foreground">Your details, and what an admin has set for you.</p>
        </header>
      </Reveal>
      {renderBody()}
    </div>
  )
}
