import type { ReactNode } from 'react'
import { UserAvatar } from '@/components/shared/user-avatar'

type ProfileIdentityCardProps = {
  name: string
  email: string
  photo: string | null
  // Pills under the email: a role, a verification status.
  badges?: ReactNode
}

// Who the person is, at a glance: a large profile picture on a soft gradient band, then their name,
// email and a few badges. With no photo it shows their initials, never a placeholder image. Plain
// markup with no hooks of its own, so any profile page can use it.
export function ProfileIdentityCard({ name, email, photo, badges }: ProfileIdentityCardProps) {
  return (
    <section
      aria-label="Profile summary"
      className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10"
    >
      <div
        aria-hidden="true"
        className="h-24 bg-linear-to-br from-primary/40 via-info-soft to-card"
      />
      <div className="flex flex-col items-center gap-4 px-5 pb-6 text-center">
        <div className="-mt-[5.125rem] rounded-full bg-card p-1.5 shadow-card ring-1 ring-foreground/10">
          <UserAvatar name={name} photo={photo} size={152} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-2xl break-words">{name}</h2>
          <p className="text-sm break-all text-muted-foreground">{email}</p>
        </div>
        {badges && <div className="flex flex-wrap justify-center gap-2">{badges}</div>}
      </div>
    </section>
  )
}
