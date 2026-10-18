import { clientApi } from '@/lib/api/client'
import type { Insights, InsightsParams, ProviderHealth } from '@/types'

// One function per endpoint, for the browser (through the BFF). Admin only.
export const aiInsightsApi = {
  // Cached by the backend for 15 minutes. `refresh` skips that cache and spends provider quota, so
  // the backend allows it 5 times per 15 minutes (429 after that). `false` is left out of the URL.
  insights: ({ refresh }: InsightsParams = {}, signal?: AbortSignal) =>
    clientApi.get<Insights>('/ai/insights', { refresh: refresh ? true : undefined }, signal),

  // Which providers are configured and healthy, and how much of today's budget each has used.
  status: (signal?: AbortSignal) =>
    clientApi.get<ProviderHealth[]>('/ai/status', undefined, signal),
}
