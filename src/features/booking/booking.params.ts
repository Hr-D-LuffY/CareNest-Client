import { MAX_PAGE_SIZE } from '@/lib/constants'
import type { ChildListParams } from '@/types'
import type { BookingFormInput } from './booking.schema'

export type WizardStep = 1 | 2 | 3

export const WIZARD_STEPS: readonly { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Child' },
  { step: 2, label: 'Room and date' },
  { step: 3, label: 'Review' },
]

export const LAST_STEP: WizardStep = 3

// Step 1 lists every child, A to Z (the backend caps a page at 100). The server page prefetches
// with the same params, so the first paint has the children.
export const WIZARD_CHILD_PARAMS: ChildListParams = {
  page: 1,
  limit: MAX_PAGE_SIZE,
  sortBy: 'name',
  sortOrder: 'asc',
}

// Rooms offered per page in step 2.
export const WIZARD_ROOMS_PAGE_SIZE = 5

// The step from the URL (?step=). Anything that is not 1, 2 or 3 means the first step.
export function parseStep(raw: string | null | undefined): WizardStep {
  const step = Number(raw)
  return step === 2 || step === 3 ? step : 1
}

// The first step that still needs an answer. A shared link to ?step=3 with no child chosen opens
// here instead, so the review step never shows an empty booking.
export function firstIncompleteStep(values: BookingFormInput): WizardStep {
  if (!values.childId) return 1
  if (!values.roomId || !values.sessionDate) return 2
  return LAST_STEP
}

// The step to show: the one in the URL, but never past the first step that still needs an answer.
export function resolveStep(requested: WizardStep, values: BookingFormInput): WizardStep {
  const furthest = firstIncompleteStep(values)
  return requested <= furthest ? requested : furthest
}
