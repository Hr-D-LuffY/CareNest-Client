'use client'

import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { bookingApi } from '@/features/booking/booking.api'
import { formatBDT, formatHours } from '@/lib/format'
import type {
  AssignedBooking,
  AvailabilitySlot,
  Paginated,
  SlotPayload,
  StaffProfile,
  StaffTaskListParams,
  UpdateSlotPayload,
  UpdateStaffProfilePayload,
} from '@/types'
import { staffApi } from './staff.api'
import { staffKeys } from './staff.keys'
import type { StaffRatingsParams } from './staff.params'

export function useStaffRatingsQuery(staffId: string, params: StaffRatingsParams) {
  return useQuery({
    queryKey: staffKeys.ratings(staffId, params),
    queryFn: ({ signal }) => staffApi.ratings(staffId, params, signal),
    // Keep showing the old page of reviews while the next one loads.
    placeholderData: keepPreviousData,
  })
}

// The signed-in staff member's own profile (their rates, type and verification). The server page
// has already prefetched it.
export function useStaffProfileQuery() {
  return useQuery({
    queryKey: staffKeys.me(),
    queryFn: ({ signal }) => staffApi.me(signal),
    // The rate is a nicety next to the trips, so a failed read is not worth a toast.
    meta: { skipGlobalError: true },
  })
}

// The days a staff member works. Without a staff id (the profile could not be read) it stays off, and
// the calendar simply does not mark days as available or not.
export function useStaffAvailabilityQuery(staffId: string | undefined) {
  return useQuery({
    queryKey: staffKeys.availability(staffId ?? ''),
    queryFn: ({ signal }) => staffApi.availability(staffId ?? '', signal),
    enabled: Boolean(staffId),
    // A failed read is not worth a toast: the calendar works without it.
    meta: { skipGlobalError: true },
  })
}

// The sitter's task board: confirmed bookings in their rooms that still need a check-in or check-out.
export function useStaffTasksQuery(params: StaffTaskListParams) {
  return useQuery({
    queryKey: staffKeys.taskList(params),
    queryFn: ({ signal }) => staffApi.tasks(params, signal),
    // Keep showing the old list while another view or page loads, so switching does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

type TaskListSnapshot = [readonly unknown[], Paginated<AssignedBooking> | undefined][]

// Applies `update` to every cached task list (Today and All sessions both hold the same booking)
// and returns what was there before, so a failed request can put it back.
async function updateTaskLists(
  queryClient: QueryClient,
  update: (page: Paginated<AssignedBooking>) => Paginated<AssignedBooking>,
): Promise<TaskListSnapshot> {
  await queryClient.cancelQueries({ queryKey: staffKeys.tasks() })
  const previous = queryClient.getQueriesData<Paginated<AssignedBooking>>({
    queryKey: staffKeys.tasks(),
  })
  for (const [key, page] of previous) {
    if (page) queryClient.setQueryData(key, update(page))
  }
  return previous
}

function restoreTaskLists(queryClient: QueryClient, previous: TaskListSnapshot | undefined) {
  for (const [key, data] of previous ?? []) queryClient.setQueryData(key, data)
}

// Optimistic: the child moves to "In care" at once, and goes back if the backend refuses (409 "Check-in
// is only possible on the session date", "already checked in"; shown by the global toast).
export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: staffKeys.checkIn,
    mutationFn: (task: AssignedBooking) => bookingApi.checkIn(task.id),
    onMutate: async (task) => {
      const checkInAt = new Date().toISOString()
      const previous = await updateTaskLists(queryClient, (page) => ({
        ...page,
        items: page.items.map((item) =>
          item.id === task.id ? { ...item, checkinLog: { checkInAt, checkOutAt: null } } : item,
        ),
      }))
      return { previous }
    },
    onError: (_error, _task, context) => restoreTaskLists(queryClient, context?.previous),
    onSuccess: (_log, task) => toast.success(`${task.child.name} is checked in.`),
    // The refetch swaps the optimistic time for the one the backend stored.
    onSettled: () => queryClient.invalidateQueries({ queryKey: staffKeys.tasks() }),
  })
}

// Optimistic: the booking leaves the board at once (it is COMPLETED now) and comes back if the
// backend refuses. The backend charges the guardian's wallet. If the wallet is short it charges
// nothing and flags the booking, which the toast says.
export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: staffKeys.checkOut,
    mutationFn: (task: AssignedBooking) => bookingApi.checkOut(task.id),
    onMutate: async (task) => {
      const previous = await updateTaskLists(queryClient, (page) => {
        const items = page.items.filter((item) => item.id !== task.id)
        const removed = page.items.length - items.length
        return { items, meta: { ...page.meta, total: Math.max(0, page.meta.total - removed) } }
      })
      return { previous }
    },
    onError: (_error, _task, context) => restoreTaskLists(queryClient, context?.previous),
    onSuccess: ({ booking, hoursUsed }, task) => {
      const name = task.child.name
      const fee = booking.finalFee !== null ? formatBDT(booking.finalFee) : null
      const time = hoursUsed !== null ? ` after ${formatHours(hoursUsed)}` : ''
      if (booking.insufficientBalance) {
        toast.warning(
          `${name} is checked out${time}. The guardian's wallet was short${fee ? `, so ${fee} was not charged` : ''}.`,
        )
      } else {
        toast.success(
          `${name} is checked out${time}.${fee ? ` ${fee} charged to the wallet.` : ''}`,
        )
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: staffKeys.tasks() }),
  })
}

export function idOfVariables(variables: unknown): string | null {
  if (typeof variables === 'object' && variables !== null && 'id' in variables) {
    return typeof variables.id === 'string' ? variables.id : null
  }
  return null
}

// Bookings with a check-in or check-out request still running. Their buttons are disabled, so a
// quick double tap cannot turn a "Check in" into an immediate "Check out".
export function useBusyTaskIds(): ReadonlySet<string> {
  const ids = useMutationState({
    filters: { mutationKey: staffKeys.taskActions, status: 'pending' },
    select: (mutation) => idOfVariables(mutation.state.variables),
  })
  return new Set(ids.filter((id): id is string => id !== null))
}

// The profile form shows its own errors (field errors under the field, a message above the button),
// so the global toast is switched off for the edit and the upload. The saved profile goes into the
// cache, which is also what the form restarts from.

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateStaffProfilePayload) => staffApi.updateMe(payload),
    meta: { skipGlobalError: true },
    onSuccess: (profile) => queryClient.setQueryData(staffKeys.me(), profile),
  })
}

// Both uploads (the photo, the verification document) answer with the saved profile.
function useProfileUpload(
  upload: (file: File, onProgress?: (percent: number) => void) => Promise<StaffProfile>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      upload(file, onProgress),
    meta: { skipGlobalError: true },
    onSuccess: (profile) => queryClient.setQueryData(staffKeys.me(), profile),
  })
}

export const useUploadStaffPhoto = () => useProfileUpload(staffApi.uploadPhoto)

export const useUploadVerificationDocument = () =>
  useProfileUpload(staffApi.uploadVerificationDocument)

// Adding and editing a time show their own errors (a 409 overlap above the button), so the global
// toast is switched off. The Tasks calendar reads the same availability, so it updates too.

export function useCreateSlot(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SlotPayload) => staffApi.createSlot(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.availability(staffId) }),
  })
}

export function useUpdateSlot(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSlotPayload }) =>
      staffApi.updateSlot(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.availability(staffId) }),
  })
}

// Optimistic: the time leaves the week at once, and comes back if the backend refuses.
export function useDeleteSlot(staffId: string) {
  const queryClient = useQueryClient()
  const key = staffKeys.availability(staffId)
  return useMutation({
    mutationFn: (id: string) => staffApi.deleteSlot(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<AvailabilitySlot[]>(key)
      queryClient.setQueryData<AvailabilitySlot[]>(key, (slots) =>
        slots?.filter((slot) => slot.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
    onSuccess: () => toast.success('Time removed.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
