import 'server-only'
import { DEMO_ROLES, type DemoRole } from '@/features/auth/demo-roles'
import { env } from '@/lib/env'

// Demo logins live in server-only env vars, so no password ever reaches the browser bundle.
// A role whose email or password is blank has no demo account and no button.

type Credentials = { email: string; password: string }

const SOURCES: Record<DemoRole, { email?: string; password?: string }> = {
  GUARDIAN: { email: env.DEMO_GUARDIAN_EMAIL, password: env.DEMO_GUARDIAN_PASSWORD },
  SITTER: { email: env.DEMO_STAFF_EMAIL, password: env.DEMO_STAFF_PASSWORD },
  DRIVER: { email: env.DEMO_DRIVER_EMAIL, password: env.DEMO_DRIVER_PASSWORD },
  ADMIN: { email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD },
}

export function getDemoCredentials(role: DemoRole): Credentials | null {
  const { email, password } = SOURCES[role]
  return email && password ? { email, password } : null
}

// Safe to send to the browser: names only, never the credentials.
export function getAvailableDemoRoles(): DemoRole[] {
  return DEMO_ROLES.filter((role) => getDemoCredentials(role) !== null)
}
