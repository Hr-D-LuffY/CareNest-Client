import { createFormHookContexts } from '@tanstack/react-form'

// Split from use-app-form.ts so the field components can read the context without importing the
// file that imports them.
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
