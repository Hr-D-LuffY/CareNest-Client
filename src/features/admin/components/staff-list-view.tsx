'use client'

import { FilterX, SearchX, UserCog, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { cn } from '@/lib/utils'
import { type StaffProfile, VerificationStatus } from '@/types'
import {
  ADMIN_STAFF_FILTER_KEYS,
  hasAdminStaffFilters,
  parseAdminStaffViewParams,
  toAdminStaffListParams,
} from '../admin-staff.params'
import { useAdminStaffListQuery, useDeleteStaff, useVerifyStaff } from '../admin-staff.queries'
import { RejectStaffDialog } from './reject-staff-dialog'
import { StaffFilters } from './staff-filters'
import { StaffTable } from './staff-table'

export function AddStaffLink() {
  return (
    <Link
      href="/admin/staff/new"
      className={cn(
        buttonVariants(),
        'h-11 bg-cta px-5 text-sm font-semibold text-cta-foreground hover:bg-cta/90',
      )}
    >
      <UserPlus aria-hidden="true" />
      Add staff
    </Link>
  )
}

// The admin's staff list: search, filter by role and verification, verify, reject and delete. The URL
// (?q=&type=&status=&page=) is the single source of truth for the list, so a refresh or a shared link
// shows the same page. The server page has already prefetched the first load. Verifying, rejecting
// and deleting are optimistic: the row changes at once and comes back if the backend refuses.
export function StaffListView() {
  const query = useQueryParams()
  const params = parseAdminStaffViewParams({
    page: query.get('page'),
    q: query.get('q'),
    type: query.get('type'),
    status: query.get('status'),
  })
  const list = useAdminStaffListQuery(toAdminStaffListParams(params))
  const verifyStaff = useVerifyStaff()
  const deleteStaff = useDeleteStaff()

  const [staffToReject, setStaffToReject] = useState<StaffProfile | null>(null)
  const [staffToDelete, setStaffToDelete] = useState<StaffProfile | null>(null)

  const { data } = list
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1

  // Deleting the last staff member on a later page (or a hand-edited ?page=9) leaves an empty page.
  // Step back to the last page that has rows instead of showing "nothing here".
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  const empty = hasAdminStaffFilters(params) ? (
    <EmptyState
      icon={SearchX}
      title="No staff match"
      description="Nobody fits these filters. Loosen a filter, or clear them all to see every staff member."
      action={
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => query.clear(...ADMIN_STAFF_FILTER_KEYS)}
        >
          <FilterX aria-hidden="true" />
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={UserCog}
      title="No staff yet"
      description="Sitters and drivers cannot sign up on their own. Create their accounts here, then verify them so they can take bookings and trips."
      action={<AddStaffLink />}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Staff</h1>
            <p className="text-muted-foreground">
              Create sitters and drivers, and verify them before they take bookings or trips.
            </p>
          </div>
          <AddStaffLink />
        </header>
      </Reveal>

      <StaffFilters params={params} total={data?.meta.total} />

      <StaffTable
        data={data}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={query.setPage}
        onVerify={(staff) =>
          verifyStaff.mutate({ staff, payload: { status: VerificationStatus.VERIFIED } })
        }
        onReject={setStaffToReject}
        onDelete={setStaffToDelete}
        empty={empty}
      />

      <RejectStaffDialog
        staff={staffToReject}
        onOpenChange={(open) => {
          if (!open) setStaffToReject(null)
        }}
        onReject={(staff, rejectionReason) =>
          verifyStaff.mutate({
            staff,
            payload: { status: VerificationStatus.REJECTED, rejectionReason },
          })
        }
      />

      <ConfirmDialog
        open={staffToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStaffToDelete(null)
        }}
        title={staffToDelete ? `Delete ${staffToDelete.user.name}?` : 'Delete staff member?'}
        description="Their login and profile are removed and they can no longer sign in. This is refused while they still run a care room or have an open trip: reassign those first."
        confirmLabel="Delete staff member"
        cancelLabel="Keep staff member"
        onConfirm={() => {
          if (staffToDelete) deleteStaff.mutate(staffToDelete)
          setStaffToDelete(null)
        }}
      />
    </div>
  )
}
