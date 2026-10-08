import {
  type Paginated,
  type StaffProfile,
  VerificationStatus,
  type VerifyStaffPayload,
} from '@/types'

// The profile as it will look once the backend has applied a verification decision: what the
// optimistic update shows before the real answer arrives.
export function withVerification(staff: StaffProfile, payload: VerifyStaffPayload): StaffProfile {
  if (payload.status === VerificationStatus.VERIFIED) {
    return {
      ...staff,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date().toISOString(),
      rejectionReason: null,
    }
  }
  return {
    ...staff,
    verificationStatus: VerificationStatus.REJECTED,
    verifiedAt: null,
    rejectionReason: payload.rejectionReason.trim(),
  }
}

// A cached list after a decision. A list filtered by another status no longer matches the staff
// member, so they leave it (and the total drops); every other list updates the row in place.
export function applyVerificationToPage(
  page: Paginated<StaffProfile>,
  id: string,
  payload: VerifyStaffPayload,
  statusFilter: VerificationStatus | undefined,
): Paginated<StaffProfile> {
  if (statusFilter && statusFilter !== payload.status) return removeFromPage(page, id)
  return {
    ...page,
    items: page.items.map((staff) => (staff.id === id ? withVerification(staff, payload) : staff)),
  }
}

export function removeFromPage(page: Paginated<StaffProfile>, id: string): Paginated<StaffProfile> {
  const items = page.items.filter((staff) => staff.id !== id)
  const removed = page.items.length - items.length
  return { items, meta: { ...page.meta, total: Math.max(0, page.meta.total - removed) } }
}

// The status filter of a cached staff list, read back from its query key
// (['admin-staff', 'list', params]).
export function statusFilterOfList(key: readonly unknown[]): VerificationStatus | undefined {
  const params = key[2]
  if (typeof params === 'object' && params !== null && 'verificationStatus' in params) {
    return Object.values(VerificationStatus).find((status) => status === params.verificationStatus)
  }
  return undefined
}
