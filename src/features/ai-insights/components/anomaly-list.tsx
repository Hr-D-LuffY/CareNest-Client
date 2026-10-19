import {
  ArrowUpRight,
  CircleCheck,
  Info,
  type LucideIcon,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Anomaly } from '@/types'
import type { AnomalyEntityType, AnomalySeverity } from '@/types/enums'
import { sortAnomalies } from '../ai-insights.model'

type SeverityStyle = {
  label: string
  // Left edge, icon tile and word share one tone.
  edge: string
  tile: string
  icon: LucideIcon
}

// Each severity has a word and an icon as well as a colour, so the meaning never depends on colour.
const SEVERITY_STYLES: Record<AnomalySeverity, SeverityStyle> = {
  CRITICAL: {
    label: 'Critical',
    edge: 'border-l-destructive',
    tile: 'bg-destructive-soft text-destructive',
    icon: OctagonAlert,
  },
  WARNING: {
    label: 'Warning',
    edge: 'border-l-warning',
    tile: 'bg-warning-soft text-warning',
    icon: TriangleAlert,
  },
  INFO: {
    label: 'Notice',
    edge: 'border-l-info',
    tile: 'bg-info-soft text-info',
    icon: Info,
  },
}

// Where each link goes, in words. A guardian is never named here (the card links to the user page
// that already shows the name), and the platform-wide findings have nowhere else to go.
const ENTITY_LINK_LABELS: Record<AnomalyEntityType, string | null> = {
  PLATFORM: null,
  GUARDIAN: 'View guardian',
  STAFF: 'View staff member',
  ROOM: 'View room',
}

function AnomalyItem({ anomaly }: { anomaly: Anomaly }) {
  const severity = SEVERITY_STYLES[anomaly.severity]
  const linkLabel = ENTITY_LINK_LABELS[anomaly.entity.type]
  const Icon = severity.icon

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-l-4 bg-card p-3 shadow-soft sm:p-4',
        severity.edge,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', severity.tile)}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {severity.label}
        </p>
        <h4 className="font-heading text-base text-balance">{anomaly.title}</h4>
        <p className="text-sm text-pretty text-muted-foreground">{anomaly.detail}</p>
        {linkLabel && (
          <Link
            href={anomaly.entity.href}
            className="mt-1 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1 rounded-md text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-8"
          >
            {linkLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    </li>
  )
}

// What the rules found, most serious first. These come from fixed statistical rules on the
// backend, so they are listed even when no AI provider could write the summary.
export function AnomalyList({ anomalies }: { anomalies: Anomaly[] }) {
  if (anomalies.length === 0) {
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-sm text-success">
        <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <span>
          Nothing unusual found. Cancellations, ratings, revenue and rooms are all within their
          normal range.
        </span>
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {sortAnomalies(anomalies).map((anomaly) => (
        <AnomalyItem key={anomaly.id} anomaly={anomaly} />
      ))}
    </ul>
  )
}
