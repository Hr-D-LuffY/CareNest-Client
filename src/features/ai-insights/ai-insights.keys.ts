// Query keys for the admin AI insights. Kept out of the queries file ("use client") so a server page
// can use the same keys. `refresh` is not part of a key: a refreshed briefing replaces the cached one.
export const aiInsightsKeys = {
  all: ['ai-insights'] as const,
  insights: () => [...aiInsightsKeys.all, 'insights'] as const,
  status: () => [...aiInsightsKeys.all, 'status'] as const,
}
