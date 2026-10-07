'use client'

import { ProfileDetailsCard, type ProfileFact } from '@/components/shared/profile-details-card'
import { formatDate } from '@/lib/format'
import type { GuardianProfile } from '@/types'
import { ProfileForm } from './profile-form'

// What the guardian sees first: their details to read, with "Edit profile" to change them.
export function ProfileDetails({ profile }: { profile: GuardianProfile }) {
  const { phone, address } = profile.guardianProfile

  const facts: ProfileFact[] = [
    { label: 'Full name', value: profile.name },
    { label: 'Email', value: profile.email, breakAnywhere: true },
    { label: 'Phone', value: phone },
    ...(profile.createdAt ? [{ label: 'Joined', value: formatDate(profile.createdAt) }] : []),
    {
      label: 'Address',
      wide: true,
      value: address ?? <span className="text-muted-foreground">No address saved yet.</span>,
    },
  ]

  return (
    <ProfileDetailsCard
      title="Your details"
      description="Staff and CareNest use these to reach you about a session."
      editTitle="Edit your details"
      editDescription="Change your photo, name, phone or address."
      facts={facts}
      renderForm={(done) => <ProfileForm profile={profile} onDone={done} />}
    />
  )
}
