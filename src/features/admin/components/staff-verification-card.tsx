'use client'

import { ExternalLink, FileImage, ShieldCheck, ShieldX } from 'lucide-react'
import Image from 'next/image'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type StaffProfile, VerificationStatus } from '@/types'

// A soft wash in the colour of the decision, so the card that needs action stands out. The status
// badge and the text say the same thing, so colour is never the only signal.
const STATUS_WASH: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: 'from-warning-soft via-card to-card',
  [VerificationStatus.VERIFIED]: 'from-success-soft via-card to-card',
  [VerificationStatus.REJECTED]: 'from-destructive-soft via-card to-card',
}

type StaffVerificationCardProps = {
  staff: StaffProfile
  onVerify: () => void
  onReject: () => void
}

function StatusLine({ staff }: { staff: StaffProfile }) {
  if (staff.verificationStatus === VerificationStatus.VERIFIED) {
    return (
      <p className="text-sm text-muted-foreground">
        {staff.verifiedAt ? `Verified on ${formatDate(staff.verifiedAt)}. ` : ''}They can take
        bookings and trips.
      </p>
    )
  }
  if (staff.verificationStatus === VerificationStatus.REJECTED) {
    return (
      <p className="rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm">
        <span className="font-semibold">Rejected.</span>{' '}
        {staff.rejectionReason ?? 'No reason given.'}
      </p>
    )
  }
  return (
    <p className="text-sm text-muted-foreground">
      Waiting for your review. They cannot take bookings or trips until you verify them.
    </p>
  )
}

// The verification decision for one staff member: their status, the document they uploaded (an
// optional ID or certificate) and the buttons that fit the status. Verified staff can still be
// rejected, and rejected staff can be verified after another look. The request itself is run by the
// caller, which is optimistic.
export function StaffVerificationCard({ staff, onVerify, onReject }: StaffVerificationCardProps) {
  const { verificationDocument: document } = staff

  return (
    <Card className={cn('bg-linear-to-br', STATUS_WASH[staff.verificationStatus])}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 font-heading text-lg">
          Verification
          <StatusBadge kind="verification" status={staff.verificationStatus} />
        </CardTitle>
        <CardDescription>Only verified staff can take bookings and trips.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <StatusLine staff={staff} />

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Document</h3>
          {document ? (
            <>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted/40">
                <Image
                  src={document}
                  alt={`Verification document uploaded by ${staff.user.name}`}
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="object-contain"
                />
              </div>
              <a
                href={document}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-lg text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                Open full size
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center text-muted-foreground">
              <FileImage aria-hidden="true" className="size-8" />
              <p className="text-sm">
                No document uploaded. A document is optional: you can verify without one.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-5">
          {staff.verificationStatus !== VerificationStatus.VERIFIED && (
            <Button
              type="button"
              className="h-11 flex-1 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90"
              onClick={onVerify}
            >
              <ShieldCheck aria-hidden="true" />
              Verify
            </Button>
          )}
          {staff.verificationStatus !== VerificationStatus.REJECTED && (
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 px-5 text-destructive hover:text-destructive"
              onClick={onReject}
            >
              <ShieldX aria-hidden="true" />
              Reject
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
