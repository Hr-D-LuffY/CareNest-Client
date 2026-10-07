import type { ChartConfig } from '@/components/ui/chart'

// Series colours for every admin chart. They are the chart tokens in globals.css (brown/peach for
// care, amber for trips) plus our own success and destructive tokens, so light and dark both work.
export const ADMIN_CHART_CONFIG = {
  care: { label: 'Care fees', color: 'var(--chart-1)' },
  trips: { label: 'Trip fares', color: 'var(--chart-trips)' },
  bookings: { label: 'Bookings made', color: 'var(--chart-1)' },
  cancellations: { label: 'Cancellations', color: 'var(--destructive)' },
  promotions: { label: 'Waitlist promotions', color: 'var(--success)' },
  booked: { label: 'Seats taken', color: 'var(--chart-1)' },
  free: { label: 'Seats free', color: 'var(--chart-2)' },
} satisfies ChartConfig

type TipRow = { color: string; label: string; value: string }

type ChartTipProps<T> = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
  // Narrows the hovered row (the chart's payload is untyped).
  isRow: (value: unknown) => value is T
  title: (row: T) => string
  rows: (row: T) => TipRow[]
  footer?: (row: T) => string | null
}

// The hover card every admin chart shares: a title, then one coloured line per series.
export function ChartTip<T>({ active, payload, isRow, title, rows, footer }: ChartTipProps<T>) {
  const row = active ? payload?.[0]?.payload : undefined
  if (!isRow(row)) return null
  const note = footer?.(row)

  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-card">
      <p className="font-medium">{title(row)}</p>
      {rows(row).map((line) => (
        <p key={line.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: line.color }}
            />
            {line.label}
          </span>
          <span className="font-medium text-foreground tabular-nums">{line.value}</span>
        </p>
      ))}
      {note && <p className="border-t pt-1.5 text-muted-foreground">{note}</p>}
    </div>
  )
}

// The day axis of every chart: labels that would touch are dropped, and the last day (today, or the
// last day ahead) is always kept.
export const DAY_AXIS = { interval: 'preserveEnd', minTickGap: 14 } as const
