import type { AnyFormApi } from '@tanstack/react-form'
import { isApiError } from '@/lib/api/errors'

// Puts the backend's per-field validation errors (`errors[].path`) under the matching form fields.
// Returns true if at least one landed on a field, so the caller can show anything else (a wrong
// password, a rate limit, a sleeping server) as a general message instead.
export function mapServerFieldErrors(
  form: AnyFormApi,
  error: unknown,
  fieldNames: readonly string[],
): boolean {
  const fieldErrors = isApiError(error) ? error.fieldErrors : {}
  let mapped = false
  for (const name of fieldNames) {
    const message = fieldErrors[name]
    if (!message) continue
    mapped = true
    setServerFieldError(form, name, message)
  }
  return mapped
}

export function setServerFieldError(form: AnyFormApi, name: string, message: string) {
  form.setFieldMeta(name, (meta) => ({
    ...meta,
    errorMap: { ...meta.errorMap, onSubmit: message },
  }))
}
