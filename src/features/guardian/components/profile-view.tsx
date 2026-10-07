'use client'

import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { ProfileIdentityCard } from '@/components/shared/profile-identity-card'
import { ProfileSkeleton } from '@/components/shared/profile-skeleton'
import { Badge } from '@/components/ui/badge'
import { useGuardianProfile } from '../guardian.queries'
import { DeleteAccountCard } from './delete-account-card'
import { ProfileDetails } from './profile-details'

// The guardian's profile page: who they are on the left (a large picture, name and email), their
// details on the right to read first and edit on request, and closing the account below. The server
// page has already prefetched the profile, so this normally renders with data; if that failed, it
// shows a retry instead of an empty page.
export function ProfileView() {
  const { data, isPending, isError, refetch } = useGuardianProfile()

  function renderBody() {
    if (isPending) return <ProfileSkeleton />
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />
    return (
      <>
        <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <ProfileIdentityCard
            name={data.name}
            email={data.email}
            photo={data.profilePhoto}
            badges={
              <Badge variant="secondary" className="h-6 bg-info-soft px-2.5 text-info">
                Guardian
              </Badge>
            }
          />
          <ProfileDetails profile={data} />
        </div>
        <DeleteAccountCard />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Profile</h1>
          <p className="text-muted-foreground">
            Your photo and contact details. Keep your phone up to date so staff can reach you.
          </p>
        </header>
      </Reveal>
      {renderBody()}
    </div>
  )
}
