'use client'

import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { Role, VerificationStatus } from '@/types/enums'

// Shown to a staff member who is not verified yet. An admin has to verify the account before
// bookings, trips or availability work, so the pages disable those actions too.
export function VerificationBanner() {
  const session = useSession()
  if (session.role !== Role.STAFF || session.verificationStatus === VerificationStatus.VERIFIED) {
    return null
  }

  const rejected = session.verificationStatus === VerificationStatus.REJECTED

  return (
    <section
      aria-label="Verification status"
      className="flex flex-col gap-3 border-b bg-warning-soft px-4 py-3 text-warning sm:flex-row sm:items-center sm:justify-between md:px-6 lg:px-8"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">
            {rejected ? 'Verification rejected.' : 'Pending verification.'}
          </span>{' '}
          {rejected
            ? 'Upload a new verification document in your profile so an admin can review it again.'
            : 'An admin has to verify your account before you can take bookings or trips. Make sure your verification document is uploaded.'}
        </p>
      </div>
      <Link
        href="/staff/profile"
        className={cn(buttonVariants({ variant: 'outline' }), 'h-10 shrink-0 bg-transparent px-4')}
      >
        Go to profile
      </Link>
    </section>
  )
}
