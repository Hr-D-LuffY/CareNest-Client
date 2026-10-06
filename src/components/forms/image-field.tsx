'use client'

import { FileUpload } from '@/components/shared/file-upload'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type ImageFieldProps = {
  label: string
  // Whose photo it is (for the initials fallback).
  name: string
  currentPhoto?: string | null
  // 0 to 100 while the form's upload runs.
  progress?: number | null
  disabled?: boolean
  // Pixel size of the preview circle, and whether the picker sits under it instead of beside it.
  size?: number
  stacked?: boolean
}

// A photo picker bound to the surrounding form field, whose value is the chosen File or null.
export function ImageField({
  label,
  name,
  currentPhoto,
  progress,
  disabled,
  size,
  stacked,
}: ImageFieldProps) {
  const field = useFieldContext<File | null>()

  return (
    <FileUpload
      label={label}
      name={name}
      currentPhoto={currentPhoto}
      file={field.state.value}
      onFileChange={field.handleChange}
      onBlur={field.handleBlur}
      progress={progress}
      error={getFieldError(field)}
      disabled={disabled}
      size={size}
      stacked={stacked}
    />
  )
}
