'use client'

import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { useGuardianProfile } from '../guardian.queries'
import { DeleteAccountCard } from './delete-account-card'
import { ProfileForm } from './profile-form'
import { ProfileSkeleton } from './profile-skeleton'

// The guardian's profile page. The server page has already prefetched the profile, so this normally
// renders with data; if that failed, it shows a retry instead of an empty form.
export function ProfileView() {
  const { data, isPending, isError, refetch } = useGuardianProfile()

  function renderBody() {
    if (isPending) return <ProfileSkeleton />
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />
    return (
      <>
        <ProfileForm profile={data} />
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
