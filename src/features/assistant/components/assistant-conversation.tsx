'use client'

import { Blocks, CalendarCheck, ListOrdered, TriangleAlert, Wallet } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { AiErrorInfo } from '@/lib/ai-errors'
import { cn } from '@/lib/utils'
import { type PromptTopic, SUGGESTED_PROMPTS } from '../assistant-prompts'
import type { ThreadEntry } from '../use-assistant-chat'
import { ChatBubble } from './chat-bubble'
import { SunFace } from './design/mascots'

type AssistantConversationProps = {
  thread: ThreadEntry[]
  isPending: boolean
  failure: AiErrorInfo | null
  onAsk: (question: string) => void
  onRetry: () => void
  // A link in a reply was followed: the panel should close so the page is visible.
  onNavigate: () => void
}

// Each starter gets its own crayon colour and picture, so the choices are easy to tell apart.
const TOPIC_LOOK: Record<
  PromptTopic,
  { Icon: ComponentType<{ className?: string }>; disc: string }
> = {
  rooms: { Icon: Blocks, disc: 'bg-play-sky' },
  bookings: { Icon: CalendarCheck, disc: 'bg-play-sun' },
  waitlist: { Icon: ListOrdered, disc: 'bg-play-grass' },
  wallet: { Icon: Wallet, disc: 'bg-play-berry' },
}

function Welcome({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl">How can I help?</h3>
        <p className="text-sm text-foreground/80">
          Ask about care rooms and open seats, or about your own children, bookings, waitlist and
          wallet. I can look things up, but I can't book, cancel or pay for you.
        </p>
      </div>
      <ul className="flex flex-col gap-2" aria-label="Suggested questions">
        {SUGGESTED_PROMPTS.map(({ text, topic }) => {
          const { Icon, disc } = TOPIC_LOOK[topic]
          return (
            <li key={topic}>
              <button
                type="button"
                onClick={() => onAsk(text)}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-card px-3 py-2 text-left text-sm shadow-sm transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0"
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-play-ink text-play-ink',
                    disc,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4.5" />
                </span>
                {text}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const DOT_COLORS = ['bg-play-sky', 'bg-play-sun', 'bg-play-berry'] as const

// Three bouncing dots, so waiting for an answer feels alive. They stand still for people who asked
// for less motion, and the words stay for everyone.
function Thinking() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-play-ink bg-play-sun-soft">
        <SunFace still className="size-7" />
      </span>
      <output className="flex items-center gap-2.5 rounded-3xl rounded-bl-md border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span aria-hidden="true" className="flex gap-1">
          {DOT_COLORS.map((color, index) => (
            <span
              key={color}
              style={{ animationDelay: `${index * 150}ms` }}
              className={cn(
                'size-2.5 animate-bounce rounded-full border border-play-ink motion-reduce:animate-none',
                color,
              )}
            />
          ))}
        </span>
        Looking that up…
      </output>
    </div>
  )
}

function Failure({ failure, onRetry }: { failure: AiErrorInfo; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-card p-3 text-sm"
    >
      <p className="flex gap-2">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <span className="break-words">{failure.message}</span>
      </p>
      {failure.retryable && (
        <Button type="button" variant="outline" onClick={onRetry} className="self-start">
          Try again
        </Button>
      )}
    </div>
  )
}

// The scrolling part of the panel. It is a live log, so a screen reader announces each new answer
// without moving focus away from the chat box.
export function AssistantConversation({
  thread,
  isPending,
  failure,
  onAsk,
  onRetry,
  onNavigate,
}: AssistantConversationProps) {
  const reduceMotion = usePrefersReducedMotion()

  // A new key makes React mount a fresh sentinel, and mounting it scrolls the log to the end. That
  // follows the conversation (new turn, "looking that up", an error) with no effect to keep in sync.
  const followKey = `${thread.length}-${isPending}-${failure?.kind ?? 'ok'}`
  const scrollToEnd = (node: HTMLDivElement | null) => {
    node?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' })
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation with the care assistant"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region needs a tab stop, or people using only a keyboard cannot scroll back through the conversation
      tabIndex={0}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
    >
      {thread.length === 0 && !isPending && !failure && <Welcome onAsk={onAsk} />}
      {thread.map((entry) => (
        <ChatBubble key={entry.id} entry={entry} onNavigate={onNavigate} />
      ))}
      {isPending && <Thinking />}
      {failure && <Failure failure={failure} onRetry={onRetry} />}
      <div key={followKey} ref={scrollToEnd} aria-hidden="true" />
    </div>
  )
}
