'use client'

import { ChevronDown, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { describeAiError } from '@/lib/ai-errors'
import { cn } from '@/lib/utils'
import { describeAge } from '../ai-insights.model'
import { useInsightsQuery, useRefreshInsights } from '../ai-insights.queries'
import { InsightsBody } from './insights-body'
import { SourceBadge } from './insights-parts'
import { InsightsSkeleton } from './insights-skeleton'

// Soft sparkles in the corner of the banner. Decoration only, hidden from assistive tech.
function BannerSparkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
      <Sparkles className="absolute top-5 right-8 size-16 animate-play-bob text-warning/25 sm:size-24" />
      <Sparkles className="absolute top-24 right-28 size-8 animate-play-drift text-primary/20" />
      <Sparkles className="absolute right-3 bottom-4 size-10 animate-play-bob text-primary/15" />
    </div>
  )
}

// The admin's AI briefing. Closed it is a short banner (the briefing is only requested once it is
// opened, which also saves provider quota); open it shows the summary, the numbers, the next steps
// and the unusual things the backend's rules found.
export function InsightsCard() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const insights = useInsightsQuery(open)
  const refresh = useRefreshInsights()
  const now = useNow(60_000)

  const busy = insights.isFetching || refresh.isPending
  const loadFailure = insights.isError && !insights.data ? describeAiError(insights.error) : null
  // A failed refresh keeps the briefing on screen and says why the new one did not arrive.
  const refreshFailure = refresh.isError ? describeAiError(refresh.error) : null
  const findings = insights.data?.anomalies.length

  return (
    <section
      aria-labelledby={`${panelId}-title`}
      className="relative overflow-hidden rounded-3xl border bg-card shadow-card"
    >
      <div className="relative bg-linear-to-br from-info-soft via-warning-soft to-card p-5 sm:p-6">
        <BannerSparkles />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card"
            >
              <Sparkles className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 id={`${panelId}-title`} className="text-xl sm:text-2xl">
                AI insights
              </h2>
              <p className="max-w-md text-pretty text-foreground/80">
                {insights.data && open
                  ? describeAge(insights.data.generatedAt, now)
                  : 'A short briefing on the last 28 days: what changed, what to do next and anything unusual.'}
              </p>
              {insights.data && !open && (
                <p className="mt-1 w-fit rounded-full bg-card px-3 py-1 text-xs font-medium ring-1 ring-foreground/10">
                  {findings
                    ? `${findings} ${findings === 1 ? 'thing' : 'things'} worth a look`
                    : 'Nothing unusual found'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {open && insights.data && <SourceBadge insights={insights.data} />}
            {open && insights.data && (
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-card px-4 sm:h-10"
                disabled={busy}
                onClick={() => refresh.mutate()}
              >
                <RefreshCw aria-hidden="true" className={cn(busy && 'animate-spin')} />
                Refresh
              </Button>
            )}
            <Button
              type="button"
              className="h-11 px-5 sm:h-10"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? 'Hide insights' : 'Show insights'}
              <ChevronDown
                aria-hidden="true"
                className={cn('transition-transform duration-200', open && 'rotate-180')}
              />
            </Button>
          </div>
        </div>
      </div>

      <div id={panelId} hidden={!open}>
        {open && (
          <div
            aria-live="polite"
            className="flex flex-col gap-4 border-t p-5 motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-top-2 sm:p-6"
          >
            {refreshFailure && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm"
              >
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  {refreshFailure.kind === 'rate-limited'
                    ? 'You have refreshed a lot. Wait a few minutes, then try again.'
                    : refreshFailure.message}{' '}
                  The briefing below is the previous one.
                </span>
              </p>
            )}

            {insights.isPending ? (
              <InsightsSkeleton />
            ) : loadFailure ? (
              <div role="alert" className="flex flex-col items-start gap-3 text-sm">
                <p className="flex items-start gap-2">
                  <TriangleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                  <span>{loadFailure.message}</span>
                </p>
                {loadFailure.retryable && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 sm:h-10"
                    disabled={busy}
                    onClick={() => insights.refetch()}
                  >
                    <RefreshCw aria-hidden="true" />
                    Try again
                  </Button>
                )}
              </div>
            ) : insights.data ? (
              <InsightsBody insights={insights.data} />
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
