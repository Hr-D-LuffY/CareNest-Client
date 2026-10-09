import { clientApi } from '@/lib/api/client'
import { MAX_PAGE_SIZE } from '@/lib/constants'
import {
  type AdminStaffListParams,
  type CreateStaffPayload,
  type StaffProfile,
  StaffType,
  type UpdateStaffPayload,
  VerificationStatus,
  type VerifyStaffPayload,
} from '@/types'

// The verified staff of one type, as many as the backend returns in a page.
const verifiedOfType = (staffType: StaffType, signal?: AbortSignal) =>
  clientApi.getList<StaffProfile>(
    '/admin/staff',
    {
      page: 1,
      limit: MAX_PAGE_SIZE,
      verificationStatus: VerificationStatus.VERIFIED,
      staffType,
    } satisfies AdminStaffListParams,
    signal,
  )

// One function per endpoint, for the browser (through the BFF). Server pages use
// admin-staff.server.ts. All of them are admin-only.
export const adminStaffApi = {
  list: (params: AdminStaffListParams, signal?: AbortSignal) =>
    clientApi.getList<StaffProfile>('/admin/staff', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    clientApi.get<StaffProfile>(`/admin/staff/${id}`, undefined, signal),
  // The people a care room can be given to: verified sitters, and staff who do both. The backend
  // refuses a driver or an unverified person, so the room form only offers these. Two requests,
  // because the list can only be filtered by one staff type.
  assignable: async (signal?: AbortSignal) => {
    const [sitters, both] = await Promise.all([
      verifiedOfType(StaffType.SITTER, signal),
      verifiedOfType(StaffType.BOTH, signal),
    ])
    return [...sitters.items, ...both.items].sort((a, b) => a.user.name.localeCompare(b.user.name))
  },
  // Creates the login and the staff profile together. The new account starts unverified.
  create: (payload: CreateStaffPayload) => clientApi.post<StaffProfile>('/admin/staff', payload),
  update: (id: string, payload: UpdateStaffPayload) =>
    clientApi.patch<StaffProfile>(`/admin/staff/${id}`, payload),
  // 409 when the staff member already has that status.
  verify: (id: string, payload: VerifyStaffPayload) =>
    clientApi.patch<StaffProfile>(`/admin/staff/${id}/verify`, payload),
  // 409 while the staff member still runs a room or has an open trip.
  remove: (id: string) => clientApi.delete(`/admin/staff/${id}`),
}
