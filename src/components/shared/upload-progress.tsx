type UploadProgressProps = {
  // Screen-reader name of the bar, e.g. "Photo upload progress".
  label: string
  // 0 to 100.
  progress: number
}

// The bar under a file picker while its upload runs. The picker's form passes the progress in.
export function UploadProgress({ label, progress }: UploadProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
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
  )
}
