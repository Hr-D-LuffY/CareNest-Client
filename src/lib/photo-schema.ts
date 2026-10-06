import { z } from 'zod'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/constants'

// A photo picked in a form: nothing yet (null), or a JPEG, PNG or WEBP image of at most 5 MB. The
// same rule the backend's upload middleware applies, checked first so a bad file never leaves the
// browser. Shared by every form with a photo (child, guardian profile, staff profile).
export const photoSchema = z
  .instanceof(File)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.some((type) => type === file.type),
    'Photo must be a JPEG, PNG or WEBP image',
  )
  .refine((file) => file.size <= MAX_UPLOAD_BYTES, 'Photo must be 5 MB or smaller')
  .nullable()
