'use client'

import { ImagePlus, Trash2 } from 'lucide-react'
import { type ChangeEvent, useEffect, useId, useRef, useState } from 'react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type FileUploadProps = {
  label: string
  // Whose photo it is: the initials show until a photo is chosen.
  name: string
  // The photo already saved (a Cloudinary URL), shown until a new file is picked.
  currentPhoto?: string | null
  // The file picked but not uploaded yet.
  file: File | null
  onFileChange: (file: File | null) => void
  onBlur?: () => void
  // 0 to 100 while the upload runs, otherwise null.
  progress?: number | null
  error?: string
  disabled?: boolean
  // Pixel size of the preview circle.
  size?: number
  // Puts the buttons under the preview (centred) instead of beside it.
  stacked?: boolean
}

const MAX_MB = MAX_UPLOAD_BYTES / (1024 * 1024)
const ACCEPT = ACCEPTED_IMAGE_TYPES.join(',')

// Picks one image and previews it. It does not upload: the form uploads on submit and passes the
// progress back in, so the bar fills while the request runs. Validation (type, size) is the form's
// Zod schema, which puts the message in `error`.
export function FileUpload({
  label,
  name,
  currentPhoto,
  file,
  onFileChange,
  onBlur,
  progress = null,
  error,
  disabled,
  size = 96,
  stacked = false,
}: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // A blob URL for the chosen file, released when it changes or the component goes away.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null)
    // So choosing the same file again after removing it still fires a change.
    event.target.value = ''
    onBlur?.()
  }

  const uploading = progress !== null
  const hasPhoto = Boolean(file) || Boolean(currentPhoto)
  const describedBy = error ? `${inputId}-error` : `${inputId}-hint`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="text-sm">
        {label}
        <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
      </Label>

      <div
        className={cn('flex gap-4', stacked ? 'flex-col items-center text-center' : 'items-center')}
      >
        <UserAvatar name={name || label} photo={previewUrl ?? currentPhoto} size={size} />
        <div className={cn('flex flex-wrap items-center gap-2', stacked && 'justify-center')}>
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" />
            {hasPhoto ? 'Replace photo' : 'Choose photo'}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              disabled={disabled || uploading}
              onClick={() => onFileChange(null)}
            >
              <Trash2 aria-hidden="true" />
              Remove
              <span className="sr-only"> the selected photo</span>
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          hidden
          disabled={disabled || uploading}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Photo upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-cta transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
            {progress}%
          </span>
        </div>
      )}

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
          JPEG, PNG or WEBP, up to {MAX_MB} MB.
        </p>
      )}
    </div>
  )
}
