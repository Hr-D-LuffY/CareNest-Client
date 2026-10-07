'use client'

import { DocumentUpload } from '@/components/shared/document-upload'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type DocumentFieldProps = {
  label: string
  currentDocument?: string | null
  // 0 to 100 while the form's upload runs.
  progress?: number | null
  optional?: boolean
}

// A document picker bound to the surrounding form field, whose value is the chosen File or null.
export function DocumentField({ label, currentDocument, progress, optional }: DocumentFieldProps) {
  const field = useFieldContext<File | null>()

  return (
    <DocumentUpload
      label={label}
      currentDocument={currentDocument}
      file={field.state.value}
      onFileChange={field.handleChange}
      onBlur={field.handleBlur}
      progress={progress}
      error={getFieldError(field)}
      optional={optional}
    />
  )
}
