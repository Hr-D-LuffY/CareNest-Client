import { ROLE_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { Role } from '@/types/enums'
import type { SessionUser } from '@/types/user'

// "Guardian", "Admin", or "Staff · Sitter" for the sidebar and the user menu.
export function getRoleLabel(session: SessionUser): string {
  if (session.role === Role.STAFF && session.staffType) {
    return `${ROLE_LABEL[session.role]} · ${STAFF_TYPE_LABEL[session.staffType]}`
  }
  return ROLE_LABEL[session.role]
}
