import { isApiError, NETWORK_ERROR_MESSAGE } from '@/lib/api/errors'

// Turns whatever the AI endpoints threw into one plain description the assistant and the insights
// card can show inline. The global toast is switched off for these calls (`meta.skipGlobalError`),
// because a failed answer belongs in the conversation, not in a toast that vanishes.
//
//   network       no answer at all (offline, backend asleep, timed out)
//   rate-limited  429: too many chat messages, or too many insight refreshes
//   busy          503 "busy": every provider is out of quota or cooling down; try again soon
//   unavailable   503 "not configured", or 502: the AI feature is off or the model gave nothing usable
//   forbidden     403: the signed-in role may not use this endpoint
//   invalid       400: the request itself was refused (e.g. the last message was not the guardian's)
//   unknown       anything else
export type AiErrorKind =
  | 'network'
  | 'rate-limited'
  | 'busy'
  | 'unavailable'
  | 'forbidden'
  | 'invalid'
  | 'unknown'

export type AiErrorInfo = {
  kind: AiErrorKind
  // Safe to show as it is.
  message: string
  // Whether a "Try again" button makes sense. A rate limit is retryable too, just not immediately.
  retryable: boolean
}

// The words name the feature the person was using: the guardian's chat is "the assistant", the
// admin's briefing is "AI insights".
export type AiSubject = 'assistant' | 'insights'

const FEATURE_MESSAGES: Record<AiSubject, { unavailable: string; busy: string }> = {
  assistant: {
    unavailable: 'The assistant is unavailable right now.',
    busy: 'The assistant is busy right now. Please try again in a moment.',
  },
  insights: {
    unavailable: 'AI insights are unavailable right now.',
    busy: 'AI insights are busy right now. Please try again in a moment.',
  },
}

export const AI_UNAVAILABLE_MESSAGE = FEATURE_MESSAGES.assistant.unavailable
export const AI_RATE_LIMITED_MESSAGE = "You're going a bit fast. Wait a minute, then try again."
export const AI_FORBIDDEN_MESSAGE = "Your account can't use this feature."
const GENERIC_MESSAGE = 'Something went wrong. Please try again.'

// The backend sends 503 for two different reasons and tells them apart only by message.
const NOT_CONFIGURED_PATTERN = /not configured/i

export function describeAiError(error: unknown, subject: AiSubject = 'assistant'): AiErrorInfo {
  const messages = FEATURE_MESSAGES[subject]
  if (!isApiError(error)) {
    return { kind: 'unknown', message: GENERIC_MESSAGE, retryable: true }
  }

  // The BFF answers 502 with the network message when it cannot reach the backend at all.
  if (error.isNetworkError || error.message === NETWORK_ERROR_MESSAGE) {
    return { kind: 'network', message: NETWORK_ERROR_MESSAGE, retryable: true }
  }

  switch (error.status) {
    case 429:
      return { kind: 'rate-limited', message: AI_RATE_LIMITED_MESSAGE, retryable: true }
    case 503:
      return NOT_CONFIGURED_PATTERN.test(error.message)
        ? { kind: 'unavailable', message: messages.unavailable, retryable: true }
        : { kind: 'busy', message: messages.busy, retryable: true }
    case 502:
      return { kind: 'unavailable', message: messages.unavailable, retryable: true }
    case 403:
      return { kind: 'forbidden', message: AI_FORBIDDEN_MESSAGE, retryable: false }
    case 400:
      // The backend's own wording is specific and safe ("The last message must be from the user").
      return { kind: 'invalid', message: error.message, retryable: false }
    default:
      return { kind: 'unknown', message: error.message || GENERIC_MESSAGE, retryable: true }
  }
}
