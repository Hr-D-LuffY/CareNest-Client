import { imageFileSchema } from '@/lib/photo-schema'

// A document picked in a form (an ID or certificate scan): the same image rule as a photo, but
// required.
export const documentSchema = imageFileSchema('Document')
  .nullable()
  .refine((file) => file !== null, 'Choose a document to upload')
