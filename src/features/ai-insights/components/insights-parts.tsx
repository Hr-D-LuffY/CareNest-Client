import {
  Bot,
  CalendarCheck,
  CalendarX,
  type LucideIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Insights, InsightsMetrics } from '@/types'
import { type AiProviderName, InsightsSource } from '@/types/enums'
import { describeTrend } from '../ai-insights.model'

// The metrics window the backend uses (last 28 days against the 28 before).
const PERIOD_DAYS = 28

const PROVIDER_LABELS: Record<AiProviderName, string> = {
  gemini: 'Gemini',
  groq: 'Groq',
  openrouter: 'OpenRouter',
}

// Who wrote the text: a model, or the backend's own template when no provider could answer.
export function SourceBadge({ insights }: { insights: Insights }) {
  const byAi = insights.source === InsightsSource.AI
  const provider = insights.provider ? PROVIDER_LABELS[insights.provider] : null

  return (
    <Badge
      variant="secondary"
      className={cn(
        'h-6 px-2.5',
        byAi
          ? 'bg-card text-foreground ring-1 ring-foreground/10'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <Bot aria-hidden="true" />
      {byAi
        ? `AI summary${provider ? ` · ${provider}` : ''}`
        : 'Rule-based summary, AI unavailable'}
    </Badge>
  )
}

// Numbered, because they are steps in priority order rather than a loose list.
export function Recommendations({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby="insights-next-steps" className="flex flex-col gap-3">
      <h4 id="insights-next-steps" className="font-heading text-base">
        What to do next
      </h4>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={item} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3 text-sm">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums"
            >
              {index + 1}
            </span>
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

type Figure = {
  icon: LucideIcon
  label: string
  value: string
  comparison: InsightsMetrics['overview']['bookings']
  // Whether a rise is bad news (cancellations), so the colour follows the meaning.
  risingIsBad?: boolean
}

// The three numbers the briefing rests on, each with its movement in words, an arrow and a colour.
export function MetricsStrip({ metrics }: { metrics: InsightsMetrics }) {
  const { bookings, cancellations, revenue } = metrics.overview
  const figures: Figure[] = [
    {
      icon: CalendarCheck,
      label: 'Bookings',
      value: bookings.current.toLocaleString('en-US'),
      comparison: bookings,
    },
    {
      icon: CalendarX,
      label: 'Cancellations',
      value: cancellations.current.toLocaleString('en-US'),
      comparison: cancellations,
      risingIsBad: true,
    },
    {
      icon: Wallet,
      label: 'Revenue',
      value: formatBDT(Math.round(revenue.current)),
      comparison: revenue,
    },
  ]

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {figures.map(({ icon: Icon, label, value, comparison, risingIsBad }) => {
        const trend = describeTrend(comparison, PERIOD_DAYS)
        const bad = trend.direction === (risingIsBad ? 'up' : 'down')
        const good = trend.direction === (risingIsBad ? 'down' : 'up')
        const Arrow = trend.direction === 'down' ? TrendingDown : TrendingUp

        return (
          <div
            key={label}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-soft"
          >
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-lg bg-info-soft text-info"
              >
                <Icon className="size-4" />
              </span>
              <span>
                {label}
                <span className="sr-only">, last {PERIOD_DAYS} days</span>
              </span>
            </dt>
            <dd className="font-heading text-3xl tabular-nums">{value}</dd>
            <dd
              className={cn(
                'flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                bad && 'bg-destructive-soft text-destructive',
                good && 'bg-success-soft text-success',
                !bad && !good && 'bg-muted text-muted-foreground',
              )}
            >
              {trend.direction !== 'flat' && <Arrow aria-hidden="true" className="size-3.5" />}
              {trend.text}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
