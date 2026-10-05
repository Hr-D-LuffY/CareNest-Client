// A hairline with a short label in the middle ("OR", "Try a demo account").
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {label}
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  )
}
