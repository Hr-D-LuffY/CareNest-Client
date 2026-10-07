'use client'

import { useEffect, useState } from 'react'

// A blob URL for a file the user picked, so it can be previewed before it is uploaded. It is null
// while there is no file, and released when the file changes or the component goes away.
export function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return url
}
