'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roomKeys } from '@/features/room/room.keys'
import type {
  AdminStaffListParams,
  CreateStaffPayload,
  Paginated,
  StaffProfile,
  UpdateStaffPayload,
  VerifyStaffPayload,
} from '@/types'
import { adminStaffApi } from './admin-staff.api'
import { adminStaffKeys } from './admin-staff.keys'
import {
  applyVerificationToPage,
  removeFromPage,
  statusFilterOfList,
  withVerification,
} from './admin-staff.model'

export function useAdminStaffListQuery(params: AdminStaffListParams) {
  return useQuery({
    queryKey: adminStaffKeys.list(params),
    queryFn: ({ signal }) => adminStaffApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging and filtering do not flash a
    // skeleton.
    placeholderData: keepPreviousData,
  })
}

// The verified sitters a room can be given to, for the room form. Stays off until the form opens.
export function useAssignableStaffQuery(enabled = true) {
  return useQuery({
    queryKey: adminStaffKeys.assignable(),
    queryFn: ({ signal }) => adminStaffApi.assignable(signal),
    enabled,
    // The form shows its own message under the field.
    meta: { skipGlobalError: true },
  })
}

// One staff member, for their detail page. The server page has already loaded it.
export function useAdminStaffQuery(id: string) {
  return useQuery({
    queryKey: adminStaffKeys.detail(id),
    queryFn: ({ signal }) => adminStaffApi.get(id, signal),
  })
}

// Create and edit show their own errors (field errors under the field, a message above the button),
// so the global toast is switched off for them.

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => adminStaffApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.assignable() })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) =>
      adminStaffApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: (staff) => {
      queryClient.setQueryData(adminStaffKeys.detail(staff.id), staff)
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.assignable() })
      // Rooms show the staff member's name, type and rate.
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

type VerifyVariables = { staff: StaffProfile; payload: VerifyStaffPayload }

// Optimistic: the staff member shows the new status at once (and leaves a list filtered by another
// status), and comes back if the backend refuses (409 "Staff is already verified", shown by the
// global toast).
export function useVerifyStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ staff, payload }: VerifyVariables) => adminStaffApi.verify(staff.id, payload),
    onMutate: async ({ staff, payload }) => {
      await queryClient.cancelQueries({ queryKey: adminStaffKeys.all })
      const detailKey = adminStaffKeys.detail(staff.id)
      const previousLists = queryClient.getQueriesData<Paginated<StaffProfile>>({
        queryKey: adminStaffKeys.lists(),
      })
      const previousDetail = queryClient.getQueryData<StaffProfile>(detailKey)

      for (const [key, page] of previousLists) {
        if (!page) continue
        queryClient.setQueryData(
          key,
          applyVerificationToPage(page, staff.id, payload, statusFilterOfList(key)),
        )
      }
      if (previousDetail) {
        queryClient.setQueryData(detailKey, withVerification(previousDetail, payload))
      }
      return { previousLists, previousDetail, detailKey }
    },
    onError: (_error, _variables, context) => {
      for (const [key, data] of context?.previousLists ?? []) queryClient.setQueryData(key, data)
      if (context?.previousDetail) {
        queryClient.setQueryData(context.detailKey, context.previousDetail)
      }
    },
    onSuccess: (_saved, { staff, payload }) => {
      const name = staff.user.name
      toast.success(
        payload.status === 'VERIFIED'
          ? `${name} is verified and can now take bookings and trips.`
          : `${name} was rejected. They can see your reason in their profile.`,
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminStaffKeys.all }),
  })
}

// Optimistic: the staff member leaves every cached list at once, and comes back if the backend
// refuses (409 "Cannot delete staff who still have rooms or open transport bookings…", shown by the
// global toast). Their detail page is left alone, so it does not refetch a profile that is gone.
export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (staff: StaffProfile) => adminStaffApi.remove(staff.id),
    onMutate: async (staff) => {
      await queryClient.cancelQueries({ queryKey: adminStaffKeys.lists() })
      const previous = queryClient.getQueriesData<Paginated<StaffProfile>>({
        queryKey: adminStaffKeys.lists(),
      })
      for (const [key, page] of previous) {
        if (page) queryClient.setQueryData(key, removeFromPage(page, staff.id))
      }
      return { previous }
    },
    onError: (_error, _staff, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSuccess: (_result, staff) => toast.success(`${staff.user.name} was removed.`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminStaffKeys.assignable() })
    },
  })
}
