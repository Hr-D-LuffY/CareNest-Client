import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { StaffType } from '@/types'

// What each staff type does, as the choice cards of the staff forms show it.
export const STAFF_TYPE_OPTIONS = [
  {
    value: StaffType.SITTER,
    label: STAFF_TYPE_LABEL.SITTER,
    description: 'Runs care rooms. Paid by the hour.',
  },
  {
    value: StaffType.DRIVER,
    label: STAFF_TYPE_LABEL.DRIVER,
    description: 'Drives children to and from care. Paid by the minute.',
  },
  {
    value: StaffType.BOTH,
    label: STAFF_TYPE_LABEL.BOTH,
    description: 'Does both, so both rates are needed.',
  },
] as const
