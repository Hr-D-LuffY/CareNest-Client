import { z } from 'zod'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/constants'

// A file picked in a form, which must be a JPEG, PNG or WEBP image of at most 5 MB. The same rule the
// backend's upload middleware applies, checked first so a bad file never leaves the browser. `label`
// is the noun in the error messages ("Photo", "Document").
export const imageFileSchema = (label: string) =>
  z
    .instanceof(File)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.some((type) => type === file.type),
      `${label} must be a JPEG, PNG or WEBP image`,
    )
    .refine((file) => file.size <= MAX_UPLOAD_BYTES, `${label} must be 5 MB or smaller`)

// A photo picked in a form: nothing yet (null), or an image. Shared by every form with a photo
// (child, guardian profile, staff profile).
export const photoSchema = imageFileSchema('Photo').nullable()
