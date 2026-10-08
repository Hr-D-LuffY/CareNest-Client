import { STAFF_STEP_SCHEMAS, type StaffFormInput } from './admin-staff.schema'

export type StaffWizardStep = 1 | 2 | 3

export const STAFF_WIZARD_STEPS: readonly { step: StaffWizardStep; label: string }[] = [
  { step: 1, label: 'Account' },
  { step: 2, label: 'Role and rates' },
  { step: 3, label: 'Review' },
]

export const LAST_STAFF_STEP: StaffWizardStep = 3

// The step from the URL (?step=). Anything that is not 2 or 3 means the first step.
export function parseStaffStep(raw: string | null | undefined): StaffWizardStep {
  const step = Number(raw)
  return step === 2 || step === 3 ? step : 1
}

// The first step whose answers do not pass yet.
function firstIncompleteStep(values: StaffFormInput): StaffWizardStep {
  if (!STAFF_STEP_SCHEMAS[1].safeParse(values).success) return 1
  if (!STAFF_STEP_SCHEMAS[2].safeParse(values).success) return 2
  return LAST_STAFF_STEP
}

// The step to show: the one in the URL, but never past the first step that still needs an answer.
// A refresh on ?step=3 (the form is empty again) opens the first step instead of an empty review.
export function resolveStaffStep(
  requested: StaffWizardStep,
  values: StaffFormInput,
): StaffWizardStep {
  const furthest = firstIncompleteStep(values)
  return requested <= furthest ? requested : furthest
}
