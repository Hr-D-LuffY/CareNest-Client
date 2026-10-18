import { clientApi } from '@/lib/api/client'
import type { ChatPayload, ChatReply } from '@/types'

// One function per endpoint, for the browser (through the BFF). No AI key or provider URL exists on
// this side: the backend owns the gateway.
export const assistantApi = {
  // Guardian only. 503 when no provider is configured or all are busy, 429 past the rate limit.
  // Never retried: a second call would spend the provider quota twice.
  chat: (payload: ChatPayload) => clientApi.post<ChatReply>('/ai/chat', payload),
}
