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
