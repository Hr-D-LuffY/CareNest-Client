import { createFormHook } from '@tanstack/react-form'
import { ChoiceField } from '@/components/forms/choice-field'
import { DateField } from '@/components/forms/date-field'
import { DocumentField } from '@/components/forms/document-field'
import { fieldContext, formContext } from '@/components/forms/form-context'
import { ImageField } from '@/components/forms/image-field'
import { PasswordField } from '@/components/forms/password-field'
import { RatingField } from '@/components/forms/rating-field'
import { SelectField } from '@/components/forms/select-field'
import { SubmitButton } from '@/components/forms/submit-button'
import { TextField } from '@/components/forms/text-field'
import { TextareaField } from '@/components/forms/textarea-field'
import { TimeField } from '@/components/forms/time-field'

// The one way to build a form in this app. Every form gets the same fields and submit button, so
// they all look and behave alike. Pass a Zod schema as `validators.onChange`/`onBlur`.
//
//   const form = useAppForm({ defaultValues, validators: { onChange: schema }, onSubmit })
//   <form.AppField name="email">{(field) => <field.TextField label="Email" />}</form.AppField>
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    PasswordField,
    DateField,
    TimeField,
    DocumentField,
    ChoiceField,
    ImageField,
    RatingField,
    SelectField,
  },
  formComponents: { SubmitButton },
})
