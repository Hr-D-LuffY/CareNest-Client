'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInsightsApi } from './ai-insights.api'
import { aiInsightsKeys } from './ai-insights.keys'

// The admin's AI briefing. A failure is shown inside the card with a retry, so the global toast is
// off. No automatic retry either: a retry would spend provider quota a second time.
// `enabled` stays false until the admin opens the card, so the page does not spend provider quota
// on a briefing nobody asked to read.
export function useInsightsQuery(enabled: boolean) {
  return useQuery({
    queryKey: aiInsightsKeys.insights(),
    queryFn: ({ signal }) => aiInsightsApi.insights({}, signal),
    enabled,
    retry: false,
    meta: { skipGlobalError: true },
  })
}

// "Refresh" skips the backend's 15-minute cache (5 per 15 minutes, then 429). The new briefing
// replaces the cached one, so the card never shows two.
export function useRefreshInsights() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => aiInsightsApi.insights({ refresh: true }),
    onSuccess: (insights) => queryClient.setQueryData(aiInsightsKeys.insights(), insights),
    meta: { skipGlobalError: true },
  })
}
