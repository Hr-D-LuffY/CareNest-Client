import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { staffKeys } from '@/features/staff/staff.keys'
import { REVIEWS_PAGE_SIZE } from '@/features/staff/staff.params'
import { getStaffAvailability, getStaffRatings } from '@/features/staff/staff.server'
import { ApiError } from '@/lib/api/errors'
import { DEFAULT_PAGE } from '@/lib/constants'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types'
import { adminStaffKeys } from '../admin-staff.keys'
import { getAdminStaff } from '../admin-staff.server'
import { StaffDetailView } from './staff-detail-view'

// A staff member that does not exist, or an id that is not even a UUID (the backend answers 400),
// is a 404 page. Any other failure goes to the error boundary.
async function loadStaff(id: string) {
  try {
    return await getAdminStaff(id)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// The hours and reviews are not essential: if one fails the profile still shows, and the client
// section fetches it again and shows its own error with a retry. A signed-out session is still an
// error, so the usual redirect can run.
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) throw error
    return null
  }
}

type AdminStaffDetailProps = {
  // The staff profile id (not the user id).
  staffId: string
  // The reviews page, from the URL (?page=).
  page: string | undefined
  // Where the "back" link and a finished delete go: the staff list, or the user list when the admin
  // came from a user's profile.
  backHref: string
  backLabel: string
}

// One staff member for the admin. The profile, their weekly hours (sitters only) and the first page
// of reviews are fetched here on the server and handed to the client view through the query cache.
// Both /admin/staff/[id] and /admin/users/[id] (for a staff user) render this, so the admin stays
// in the section they came from.
export async function AdminStaffDetail({
  staffId,
  page,
  backHref,
  backLabel,
}: AdminStaffDetailProps) {
  const staff = await loadStaff(staffId)

  const pageNumber = Number(page)
  const ratingsParams = {
    page: Number.isInteger(pageNumber) && pageNumber >= DEFAULT_PAGE ? pageNumber : DEFAULT_PAGE,
    limit: REVIEWS_PAGE_SIZE,
  }

  const [ratings, availability] = await Promise.all([
    orNull(getStaffRatings(staff.id, ratingsParams)),
    staff.staffType === StaffType.DRIVER ? null : orNull(getStaffAvailability(staff.id)),
  ])

  const queryClient = makeQueryClient()
  queryClient.setQueryData(adminStaffKeys.detail(staffId), staff)
  if (ratings) queryClient.setQueryData(staffKeys.ratings(staff.id, ratingsParams), ratings)
  if (availability) queryClient.setQueryData(staffKeys.availability(staff.id), availability)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffDetailView id={staffId} backHref={backHref} backLabel={backLabel} />
    </HydrationBoundary>
  )
}
