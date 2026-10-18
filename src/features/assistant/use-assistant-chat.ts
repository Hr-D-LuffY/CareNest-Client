'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { AI_UNAVAILABLE_MESSAGE, type AiErrorInfo, describeAiError } from '@/lib/ai-errors'
import type { AssistantRoom, ChatLink, ChatMessage } from '@/types'
import { assistantApi } from './assistant.api'
import { toChatPayload } from './assistant.schema'

// One line of the conversation as the screen keeps it. Only `role` and `content` go to the backend;
// the rest is for display. `rooms` and `links` come from the backend's own search, never from the
// reply text, and are empty on the guardian's turns.
export type ThreadEntry = ChatMessage & {
  id: string
  rooms: AssistantRoom[]
  links: ChatLink[]
}

const EMPTY_REPLY_FAILURE: AiErrorInfo = {
  kind: 'unavailable',
  message: AI_UNAVAILABLE_MESSAGE,
  retryable: true,
}

// The care assistant's conversation. The backend keeps nothing between calls, so the whole thread
// lives here in React state (it is gone on a page reload, on purpose) and the last 10 turns are
// sent with every question.
export function useAssistantChat() {
  const [thread, setThread] = useState<ThreadEntry[]>([])
  const [failure, setFailure] = useState<AiErrorInfo | null>(null)

  // A failed answer is shown inside the conversation with a retry, so the global toast stays off.
  const chat = useMutation({
    mutationFn: assistantApi.chat,
    meta: { skipGlobalError: true },
  })

  async function ask(history: ThreadEntry[]) {
    setFailure(null)
    try {
      const reply = await chat.mutateAsync(toChatPayload(history))
      if (!reply.reply.trim()) {
        setFailure(EMPTY_REPLY_FAILURE)
        return
      }
      setThread((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply.reply,
          rooms: reply.rooms,
          links: reply.links,
        },
      ])
    } catch (error) {
      setFailure(describeAiError(error))
    }
  }

  // Adds the guardian's question and asks. One question at a time: a second call while an answer is
  // on its way would spend the providers' free quota twice.
  async function send(question: string) {
    const content = question.trim()
    if (!content || chat.isPending) return
    const history: ThreadEntry[] = [
      ...thread,
      { id: crypto.randomUUID(), role: 'user', content, rooms: [], links: [] },
    ]
    setThread(history)
    await ask(history)
  }

  // Asks again with the same thread, after a failure. The guardian's last question is still in it.
  async function retry() {
    if (chat.isPending) return
    await ask(thread)
  }

  function reset() {
    if (chat.isPending) return
    setThread([])
    setFailure(null)
  }

  return { thread, failure, isPending: chat.isPending, send, retry, reset }
}
