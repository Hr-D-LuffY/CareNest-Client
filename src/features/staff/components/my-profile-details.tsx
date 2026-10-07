'use client'

import { ProfileDetailsCard, type ProfileFact } from '@/components/shared/profile-details-card'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatDate } from '@/lib/format'
import type { StaffProfile } from '@/types'
import { MyProfileForm } from './my-profile-form'

function yearsLabel(years: number) {
  return `${years} ${years === 1 ? 'year' : 'years'}`
}

// What the staff member sees first: their details to read, with "Edit profile" to change them. Role
// and rates are shown but are set by an admin.
export function MyProfileDetails({ profile }: { profile: StaffProfile }) {
  const facts: ProfileFact[] = [
    { label: 'Full name', value: profile.user.name },
    { label: 'Email', value: profile.user.email, breakAnywhere: true },
    { label: 'Role', value: STAFF_TYPE_LABEL[profile.staffType] },
    { label: 'Experience', value: yearsLabel(profile.experience) },
    ...(profile.hourlyRate !== null
      ? [{ label: 'Care rate', value: `${formatBDT(profile.hourlyRate)} per hour` }]
      : []),
    ...(profile.perMinuteRate !== null
      ? [{ label: 'Trip rate', value: `${formatBDT(profile.perMinuteRate)} per minute` }]
      : []),
    { label: 'Joined', value: formatDate(profile.createdAt) },
    {
      label: 'About you',
      wide: true,
      value: profile.bio ?? (
        <span className="text-muted-foreground">
          You have not written anything about yourself yet.
        </span>
      ),
    },
  ]

  return (
    <ProfileDetailsCard
      title="Your details"
      description="How you appear to the team. Your role and rates are set by an admin."
      editTitle="Edit your details"
      editDescription="Change your photo, name, a few words about you, or your experience."
      facts={facts}
      renderForm={(done) => <MyProfileForm profile={profile} onDone={done} />}
    />
  )
}
