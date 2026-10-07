import { MAX_PAGE_SIZE } from '@/lib/constants'
import type { StaffTaskListParams } from '@/types'

// The board loads the sitter's nearest sessions once (oldest first, the backend's order) and filters
// them by day on the client, so the day picker can show every upcoming class with its head count and
// switching days is instant. 100 is the backend's page limit.
export const TASKS_PARAMS: StaffTaskListParams = { page: 1, limit: MAX_PAGE_SIZE }

// ?date= holds what the board shows: a "YYYY-MM-DD" session day, or one of these groups. No param
// means today. "later" is the sessions after the calendar's last day, and "missed" the sessions whose
// day passed with no check-in.
export const LATER_DATES = 'later'
export const MISSED_DATES = 'missed'

const GROUPS: readonly string[] = [LATER_DATES, MISSED_DATES]

export type TaskDateParam = string

// The raw ?date= value, or undefined when it is missing or not a day ("?date=banana" means today).
export function parseTaskDate(raw: string | null | undefined): TaskDateParam | undefined {
  if (!raw) return undefined
  return GROUPS.includes(raw) || /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined
}
