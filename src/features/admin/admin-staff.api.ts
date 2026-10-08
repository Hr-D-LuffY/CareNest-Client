import { clientApi } from '@/lib/api/client'
import type {
  AdminStaffListParams,
  CreateStaffPayload,
  StaffProfile,
  UpdateStaffPayload,
  VerifyStaffPayload,
} from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use
// admin-staff.server.ts. All of them are admin-only.
export const adminStaffApi = {
  list: (params: AdminStaffListParams, signal?: AbortSignal) =>
    clientApi.getList<StaffProfile>('/admin/staff', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    clientApi.get<StaffProfile>(`/admin/staff/${id}`, undefined, signal),
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
