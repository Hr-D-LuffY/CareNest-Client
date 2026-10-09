import { ArrowLeft, Baby, CalendarCheck, ChevronDown, Phone } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ProfileIdentityCard } from '@/components/shared/profile-identity-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAge, formatBDT, formatDate, formatSessionDate } from '@/lib/format'
import { type AdminUserDetail, BookingStatus, Role } from '@/types'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  )
}

// The order the booking counts are shown in.
const BOOKING_STATUSES = [
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
  BookingStatus.PENDING,
  BookingStatus.CANCELLED,
] as const

type Guardian = NonNullable<AdminUserDetail['guardianProfile']>

type Child = Guardian['children'][number]

// One child. The summary row (photo, name, age, tier) opens to the details only an admin, the room's
// sitter and the guardian see: allergies, conditions and who to call. A native <details>, so it is
// keyboard and screen-reader friendly with no script.
function ChildCard({ child }: { child: Child }) {
  return (
    <details className="group rounded-xl border">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-xl p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <UserAvatar name={child.name} photo={child.profilePhoto} size={44} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-medium break-words">{child.name}</span>
          <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {formatAge(child.dateOfBirth.slice(0, 10))}
            <TierBadge tier={child.tier} />
          </span>
        </span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Details</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform motion-reduce:transition-none group-open:rotate-180"
          />
        </span>
      </summary>
      <dl className="grid gap-x-6 gap-y-4 border-t p-4 sm:grid-cols-2">
        <Fact label="Date of birth">{formatDate(child.dateOfBirth)}</Fact>
        <Fact label="Added on">{formatDate(child.createdAt)}</Fact>
        <Fact label="Allergies">
          {child.allergies ?? <span className="text-muted-foreground">None listed.</span>}
        </Fact>
        <Fact label="Medical conditions">
          {child.conditions ?? <span className="text-muted-foreground">None listed.</span>}
        </Fact>
        <Fact label="Emergency contact">
          <span className="flex flex-col">
            {child.emergencyContactName}
            <a
              href={`tel:${child.emergencyContactPhone}`}
              className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Phone aria-hidden="true" className="size-3.5" />
              {child.emergencyContactPhone}
            </a>
          </span>
        </Fact>
      </dl>
    </details>
  )
}

function GuardianDetails({ user, guardian }: { user: AdminUserDetail; guardian: Guardian }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Contact and wallet</CardTitle>
          <CardDescription>How to reach this guardian, and what they can spend.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Fact label="Full name">{user.name}</Fact>
            <Fact label="Email">
              <span className="break-all">{user.email}</span>
            </Fact>
            <Fact label="Phone">{guardian.phone}</Fact>
            <Fact label="Joined">{user.createdAt ? formatDate(user.createdAt) : '–'}</Fact>
            <Fact label="Wallet balance">
              <span className="font-semibold tabular-nums">
                {formatBDT(guardian.walletBalance)}
              </span>
            </Fact>
            <Fact label="Address">
              {guardian.address ?? <span className="text-muted-foreground">Not given.</span>}
            </Fact>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Bookings</CardTitle>
          <CardDescription>How many seats this guardian has booked, by status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BOOKING_STATUSES.map((status) => (
              <li key={status} className="flex flex-col items-start gap-2 rounded-xl border p-3">
                <StatusBadge kind="booking" status={status} />
                <span className="font-heading text-2xl tabular-nums">
                  {guardian.bookingsByStatus[status] ?? 0}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-base">Newest bookings</h3>
            {guardian.recentBookings.length === 0 ? (
              <EmptyState
                bare
                icon={CalendarCheck}
                title="No bookings yet"
                description="Their bookings will be listed here once they book a seat."
              />
            ) : (
              <ul className="flex flex-col divide-y">
                {guardian.recentBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium break-words">{booking.child.name}</span>
                      <span className="text-sm text-muted-foreground">
                        <Link
                          href={`/admin/rooms/${booking.room.id}`}
                          className="rounded-sm underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {booking.room.name}
                        </Link>{' '}
                        · {formatSessionDate(booking.sessionDate)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {booking.status !== BookingStatus.CANCELLED && (
                        <span className="text-sm tabular-nums">
                          {formatBDT(booking.finalFee ?? booking.estimatedFee)}
                          {!booking.finalFee && (
                            <span className="text-xs text-muted-foreground"> est.</span>
                          )}
                        </span>
                      )}
                      <StatusBadge kind="booking" status={booking.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Children{' '}
            <span className="text-muted-foreground tabular-nums">({guardian.children.length})</span>
          </CardTitle>
          <CardDescription>
            The children on this guardian's account. Open one to see their medical and emergency
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guardian.children.length === 0 ? (
            <EmptyState
              bare
              icon={Baby}
              title="No children added"
              description="They have not added a child yet, so they cannot book a seat."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {guardian.children.map((child) => (
                <li key={child.id}>
                  <ChildCard child={child} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// One account for the admin: who they are and, for a guardian, their contact details, wallet,
// bookings and children. (A staff member has their own page, /admin/staff/[id]; the route sends the
// admin there.) Plain markup with no hooks, so it renders on the server.
export function UserProfileView({ user }: { user: AdminUserDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/users"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All users
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ProfileIdentityCard
          name={user.name}
          email={user.email}
          photo={user.profilePhoto}
          badges={<StatusBadge kind="role" status={user.role} />}
        />

        <div className="flex min-w-0 flex-col gap-6">
          {user.guardianProfile ? (
            <GuardianDetails user={user} guardian={user.guardianProfile} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Account</CardTitle>
                <CardDescription>
                  {user.role === Role.ADMIN
                    ? 'Admin accounts are created by the seed script, not through the app, so they have no profile to show.'
                    : 'This account has no profile to show.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Fact label="Full name">{user.name}</Fact>
                  <Fact label="Email">
                    <span className="break-all">{user.email}</span>
                  </Fact>
                  <Fact label="Joined">{user.createdAt ? formatDate(user.createdAt) : '–'}</Fact>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
