import type { Insights } from '@/types'
import { AnomalyList } from './anomaly-list'
import { MetricsStrip, Recommendations } from './insights-parts'

// The opened briefing: the written summary first, then the numbers, then the next steps beside what
// the rules found. Two columns from `lg`, one stack below.
export function InsightsBody({ insights }: { insights: Insights }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-4 sm:p-5">
        <h3 className="font-heading text-xl text-balance sm:text-2xl">{insights.headline}</h3>
        <p className="max-w-prose text-pretty whitespace-pre-line text-foreground/90">
          {insights.summary}
        </p>
      </div>

      <MetricsStrip metrics={insights.metrics} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Recommendations items={insights.recommendations} />
        </div>
        <section aria-labelledby="insights-anomalies" className="flex flex-col gap-3 lg:col-span-3">
          <h4 id="insights-anomalies" className="font-heading text-base">
            Worth a look
          </h4>
          <AnomalyList anomalies={insights.anomalies} />
        </section>
      </div>
    </div>
  )
}
