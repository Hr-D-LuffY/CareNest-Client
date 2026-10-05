// The one-click demo accounts on the login page. Staff has two (a sitter and a driver) because the
// backend role is the same (STAFF) but the staff type, and so the pages they see, differ.

export const DEMO_ROLES = ['GUARDIAN', 'SITTER', 'DRIVER', 'ADMIN'] as const
export type DemoRole = (typeof DEMO_ROLES)[number]

export const DEMO_ROLE_LABEL: Record<DemoRole, string> = {
  GUARDIAN: 'Guardian',
  SITTER: 'Sitter',
  DRIVER: 'Driver',
  ADMIN: 'Admin',
}
