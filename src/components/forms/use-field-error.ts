import type { AnyFieldApi } from '@tanstack/react-form'

// Show a field's error only once the user has left it or tried to submit, not on the first keystroke.
// Zod issues arrive as objects with a `message`; server errors set with setFieldMeta are plain strings.
export function getFieldError(field: AnyFieldApi): string | undefined {
  const { isTouched, errors } = field.state.meta
  if (!isTouched) return undefined
  for (const error of errors) {
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  }
  return undefined
}
