'use client'

import { useState } from 'react'

// Progress (0 to 100) of the upload in flight, or null when none is running. Pass `report` as the
// `onProgress` of an upload and show `progress` in a <FileUpload>.
export function useUploadProgress() {
  const [progress, setProgress] = useState<number | null>(null)
  return { progress, report: setProgress, reset: () => setProgress(null) }
}
