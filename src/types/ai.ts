import type {
  AiProviderName,
  AnomalyEntityType,
  AnomalySeverity,
  AnomalyType,
  DayOfWeek,
  InsightsSource,
  Tier,
} from './enums'

// ---- Care assistant (guardian) ----

// A turn of the conversation. The backend accepts only these two roles: the system prompt and the
// tool results are its own.
export type ChatRole = 'user' | 'assistant'

// POST /ai/chat body. The whole thread goes with every request (the backend keeps nothing).
export type ChatMessage = {
  role: ChatRole
  content: string
}

export type ChatPayload = {
  messages: ChatMessage[]
}

// A room the assistant found. The backend builds these from its own search, never from the model's text.
export type AssistantRoom = {
  id: string
  name: string
  tier: Tier
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  // YYYY-MM-DD
  sessionDate: string
  seatsLeft: number
}

// "Book this" shortcut. `href` is an in-app path such as /dashboard/book?room=&date=&child=.
export type ChatLink = {
  label: string
  href: string
}

// POST /ai/chat → data
export type ChatReply = {
  reply: string
  rooms: AssistantRoom[]
  links: ChatLink[]
  provider: AiProviderName
}

// ---- AI insights (admin) ----

// A figure against what it is compared with: the previous period, or the alert threshold.
export type PeriodComparison = {
  current: number
  previous: number
}

export type Anomaly = {
  // Stable for the same finding (type + entity), so the UI can key on it.
  id: string
  type: AnomalyType
  severity: AnomalySeverity
  title: string
  detail: string
  metric: { value: number; baseline: number }
  // The admin page for the thing concerned, built by the backend. `PLATFORM` points at /admin.
  entity: { type: AnomalyEntityType; id: string; href: string }
}

// The headline numbers on the card: the last 28 days against the 28 before, and 7 against 7.
export type InsightsMetrics = {
  overview: {
    bookings: PeriodComparison
    cancellations: PeriodComparison
    revenue: PeriodComparison
    completedCheckouts: number
    insufficientBalanceCheckouts: number
  }
  weeklyCancellations: PeriodComparison
  weeklyRevenue: PeriodComparison
}

// GET /ai/insights → data
export type Insights = {
  // ISO timestamp. A cached briefing keeps its original time, so "generated N min ago" is honest.
  generatedAt: string
  source: InsightsSource
  // Which provider wrote the narrative; null when `source` is RULES.
  provider: AiProviderName | null
  headline: string
  summary: string
  recommendations: string[]
  anomalies: Anomaly[]
  metrics: InsightsMetrics
}

// GET /ai/insights?refresh=true skips the 15-minute cache (limited to 5 per 15 minutes).
export type InsightsParams = {
  refresh?: boolean
}

// GET /ai/status → data, one entry per provider the backend knows about.
export type ProviderHealth = {
  name: AiProviderName
  model: string | null
  configured: boolean
  healthy: boolean
  usedToday: number
  dailyLimit: number | null
  tokensToday: number
  dailyTokenLimit: number | null
}
