import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TasksView } from '@/features/staff/components/tasks-view'
import { staffKeys } from '@/features/staff/staff.keys'
import {
  getMyStaffProfile,
  getStaffAvailability,
  getStaffTasksPage,
} from '@/features/staff/staff.server'
import { TASKS_PARAMS } from '@/features/staff/task.params'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Tasks' }

// The sitter's task board. Care rooms belong to sitters, so a driver (who has no rooms, and whom
// the backend would answer with a 403) goes to their trips instead.
//
// The sitter's nearest sessions and the weekdays they work are fetched here, on the server, and
// handed to the client board through the query cache, so the first paint already has them. Which day
// is shown (?date=) is picked on the client from that one list.
export default async function StaffTasksPage() {
  const session = await getSession()
  if (session?.staffType === StaffType.DRIVER) redirect('/staff/trips')

  const queryClient = makeQueryClient()

  // The availability query needs the staff id, which is not the user id, so the profile comes first.
  // If it cannot be read the calendar still works, it just does not mark days as available.
  async function prefetchAvailability(): Promise<string | undefined> {
    try {
      const { id } = await getMyStaffProfile()
      await queryClient.prefetchQuery({
        queryKey: staffKeys.availability(id),
        queryFn: () => getStaffAvailability(id),
      })
      return id
    } catch {
      return undefined
    }
  }

  // A failed prefetch is not fatal: prefetchQuery swallows it and the client board fetches (and
  // shows its own error state) instead.
  const [, staffId] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: staffKeys.taskList(TASKS_PARAMS),
      queryFn: () => getStaffTasksPage(TASKS_PARAMS),
    }),
    prefetchAvailability(),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TasksView staffId={staffId} />
    </HydrationBoundary>
  )
}
