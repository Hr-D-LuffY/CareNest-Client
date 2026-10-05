import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from '@/components/forms/form-context'
import { PasswordField } from '@/components/forms/password-field'
import { SubmitButton } from '@/components/forms/submit-button'
import { TextField } from '@/components/forms/text-field'

// The one way to build a form in this app. Every form gets the same fields and submit button, so
// they all look and behave alike. Pass a Zod schema as `validators.onChange`/`onBlur`.
//
//   const form = useAppForm({ defaultValues, validators: { onChange: schema }, onSubmit })
//   <form.AppField name="email">{(field) => <field.TextField label="Email" />}</form.AppField>
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, PasswordField },
  formComponents: { SubmitButton },
})
