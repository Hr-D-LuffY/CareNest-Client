import { ROLE_HOME_PATH } from '@/lib/constants'
import type { Role } from '@/types/enums'
import { requiredRole } from './routes'

// "?redirect=<path>" comes from the URL, so it is untrusted. Only a path inside this site is
// allowed back out: no other host (//evil.com, https://evil.com) and no backslash tricks.
const PLACEHOLDER_ORIGIN = 'http://carenest.local'

export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback
  }
  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN)
    return url.origin === PLACEHOLDER_ORIGIN ? `${url.pathname}${url.search}` : fallback
  } catch {
    return fallback
  }
}

// Where to send a user right after login. The requested page wins, unless it belongs to another
// role's area (a guardian sent to /admin), in which case their own dashboard is the safe landing.
export function resolvePostLoginPath(requested: string | null | undefined, role: Role): string {
  const path = safeRedirectPath(requested, ROLE_HOME_PATH[role])
  const owner = requiredRole(path.split('?')[0])
  return owner === null || owner === role ? path : ROLE_HOME_PATH[role]
}
