'use client'

import { ExternalLink, FileImage, FilePlus2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { type ChangeEvent, useId, useRef } from 'react'
import { UploadProgress } from '@/components/shared/upload-progress'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useObjectUrl } from '@/hooks/use-object-url'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/constants'

type DocumentUploadProps = {
  label: string
  // The document already saved (a Cloudinary URL), shown until a new file is picked.
  currentDocument?: string | null
  // The file picked but not uploaded yet.
  file: File | null
  onFileChange: (file: File | null) => void
  onBlur?: () => void
  // 0 to 100 while the upload runs, otherwise null.
  progress?: number | null
  error?: string
  optional?: boolean
}

const MAX_MB = MAX_UPLOAD_BYTES / (1024 * 1024)
const ACCEPT = ACCEPTED_IMAGE_TYPES.join(',')

// Picks one document (a scan or photo of an ID or certificate) and previews it in a landscape frame,
// where a photo picker would crop it into a circle. It does not upload: the form uploads on submit
// and passes the progress back in. Validation (type, size) is the form's Zod schema, which puts the
// message in `error`.
export function DocumentUpload({
  label,
  currentDocument,
  file,
  onFileChange,
  onBlur,
  progress = null,
  error,
  optional,
}: DocumentUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(file)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null)
    // So choosing the same file again after removing it still fires a change.
    event.target.value = ''
    onBlur?.()
  }

  const uploading = progress !== null
  const shown = previewUrl ?? currentDocument ?? null
  const describedBy = error ? `${inputId}-error` : `${inputId}-hint`

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={inputId} className="text-sm">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>

      <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border bg-muted/40">
        {shown ? (
          <Image
            src={shown}
            alt={file ? 'Preview of the document you chose' : 'Your uploaded document'}
            fill
            sizes="(min-width: 640px) 24rem, 100vw"
            // A chosen file is a local blob: there is nothing for the image optimizer to fetch.
            unoptimized={previewUrl !== null}
            className="object-contain"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 border-2 border-dashed text-muted-foreground">
            <FileImage aria-hidden="true" className="size-8" />
            <span className="text-sm">No document yet</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <FilePlus2 aria-hidden="true" />
          {file || currentDocument ? 'Replace document' : 'Choose document'}
        </Button>
        {file && (
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-3"
            disabled={uploading}
            onClick={() => onFileChange(null)}
          >
            <Trash2 aria-hidden="true" />
            Remove
            <span className="sr-only"> the selected document</span>
          </Button>
        )}
        {currentDocument && !file && (
          <a
            href={currentDocument}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Open full size
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        hidden
        disabled={uploading}
        aria-describedby={describedBy}
        onChange={handleChange}
      />

      {uploading && <UploadProgress label="Document upload progress" progress={progress} />}

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
