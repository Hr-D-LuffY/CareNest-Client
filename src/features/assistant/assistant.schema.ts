import { z } from 'zod'
import { AI_CHAT_MAX_MESSAGE_LENGTH, AI_CHAT_MAX_MESSAGES } from '@/lib/constants'
import type { ChatMessage, ChatPayload } from '@/types'

// Mirrors the backend's chatSchema (ai.interface.ts): only user and assistant turns, each 1 to 500
// characters after trimming. The backend accepts up to 50 turns but only reads the last 10, so the
// client sends just those.

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], { error: 'Role must be user or assistant' }),
  content: z
    .string({ error: 'Message content is required' })
    .trim()
    .min(1, 'Message content is required')
    .max(
      AI_CHAT_MAX_MESSAGE_LENGTH,
      `A message can be at most ${AI_CHAT_MAX_MESSAGE_LENGTH} characters`,
    ),
})

export const chatPayloadSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, 'Send at least one message')
    .max(AI_CHAT_MAX_MESSAGES, `Send at most ${AI_CHAT_MAX_MESSAGES} messages`),
})

// The box where the guardian types. The same limits, with wording for a text field.
export const chatInputSchema = z
  .string()
  .trim()
  .min(1, 'Type a question first')
  .max(
    AI_CHAT_MAX_MESSAGE_LENGTH,
    `Keep it under ${AI_CHAT_MAX_MESSAGE_LENGTH} characters (you can ask a follow-up)`,
  )

// The chat box as a form, so it goes through the same TanStack Form + Zod path as every other form.
export const chatFormSchema = z.object({ message: chatInputSchema })

export type ChatFormInput = z.input<typeof chatFormSchema>

export const EMPTY_CHAT_FORM: ChatFormInput = { message: '' }

// The request for a thread: the most recent turns only, validated. Throws a ZodError if a turn is
// empty or too long, which the chat box prevents with `chatInputSchema` before it gets here.
export function toChatPayload(thread: readonly ChatMessage[]): ChatPayload {
  return chatPayloadSchema.parse({ messages: thread.slice(-AI_CHAT_MAX_MESSAGES) })
}
