'use client'

import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ListErrorState } from '@/components/shared/list-error-state'
import { ProfileIdentityCard } from '@/components/shared/profile-identity-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StaffReviews } from '@/features/staff/components/staff-reviews'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { StaffType, VerificationStatus } from '@/types'
import { useAdminStaffQuery, useDeleteStaff, useVerifyStaff } from '../admin-staff.queries'
import { RejectStaffDialog } from './reject-staff-dialog'
import { StaffAvailabilityCard } from './staff-availability-card'
import { StaffDetailSkeleton } from './staff-detail-skeleton'
import { StaffDetailsCard } from './staff-details-card'
import { StaffEditDialog } from './staff-edit-dialog'
import { StaffVerificationCard } from './staff-verification-card'

// One staff member, for the admin: who they are, the verification decision and their document,
// their details (editable), the hours they work, what guardians say about them, and removing the
// account. The server page has already loaded the profile, the hours and the first reviews, so
// this normally renders with data. Verifying and rejecting are optimistic.
export function StaffDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: staff, isPending, isError, refetch } = useAdminStaffQuery(id)
  const verifyStaff = useVerifyStaff()
  const deleteStaff = useDeleteStaff()

  const [editing, setEditing] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function renderBody() {
    if (isPending) return <StaffDetailSkeleton />
    if (isError || !staff) return <ListErrorState onRetry={() => refetch()} />

    return (
      <>
        <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <ProfileIdentityCard
              name={staff.user.name}
              email={staff.user.email}
              photo={staff.user.profilePhoto}
              badges={
                <>
                  <Badge variant="secondary" className="h-6 bg-info-soft px-2.5 text-info">
                    {STAFF_TYPE_LABEL[staff.staffType]}
                  </Badge>
                  <StatusBadge kind="verification" status={staff.verificationStatus} />
                </>
              }
            />
            <StaffVerificationCard
              staff={staff}
              onVerify={() =>
                verifyStaff.mutate({ staff, payload: { status: VerificationStatus.VERIFIED } })
              }
              onReject={() => setRejecting(true)}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <StaffDetailsCard staff={staff} onEdit={() => setEditing(true)} />
            {staff.staffType !== StaffType.DRIVER && <StaffAvailabilityCard staffId={staff.id} />}
            <StaffReviews staffId={staff.id} staffName={staff.user.name} />

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Delete account</CardTitle>
                <CardDescription>
                  Removes their login and profile. Refused while they still run a care room or have
                  an open trip: reassign those first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 text-destructive hover:text-destructive"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 aria-hidden="true" />
                  Delete {staff.user.name}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <StaffEditDialog open={editing} onOpenChange={setEditing} staff={staff} />

        <RejectStaffDialog
          staff={rejecting ? staff : null}
          onOpenChange={setRejecting}
          onReject={(target, rejectionReason) =>
            verifyStaff.mutate({
              staff: target,
              payload: { status: VerificationStatus.REJECTED, rejectionReason },
            })
          }
        />

        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={setConfirmingDelete}
          title={`Delete ${staff.user.name}?`}
          description="Their login and profile are removed and they can no longer sign in. This is refused while they still run a care room or have an open trip."
          confirmLabel="Delete staff member"
          cancelLabel="Keep staff member"
          pending={deleteStaff.isPending}
          onConfirm={() =>
            deleteStaff.mutate(staff, {
              // Back to the list, where they are already gone.
              onSuccess: () => router.push('/admin/staff'),
              onSettled: () => setConfirmingDelete(false),
            })
          }
        />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-3">
          <Link
            href="/admin/staff"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All staff
          </Link>
          <h1 className="text-2xl text-balance break-words md:text-3xl">
            {staff ? staff.user.name : 'Staff member'}
          </h1>
        </header>
      </Reveal>
      {renderBody()}
    </div>
  )
}
