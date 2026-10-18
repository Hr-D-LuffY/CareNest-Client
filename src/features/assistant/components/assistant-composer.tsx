'use client'

import { SendHorizontal } from 'lucide-react'
import { type Ref, useId } from 'react'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { AI_CHAT_MAX_MESSAGE_LENGTH } from '@/lib/constants'
import { type ChatFormInput, chatFormSchema, EMPTY_CHAT_FORM } from '../assistant.schema'

// Show the character count only when the limit is near, so it is not noise on a short question.
const COUNTER_FROM = Math.floor(AI_CHAT_MAX_MESSAGE_LENGTH * 0.8)

type AssistantComposerProps = {
  isPending: boolean
  onSend: (question: string) => void
  inputRef: Ref<HTMLTextAreaElement>
}

// The chat box. Enter sends, Shift+Enter adds a line. The box stays enabled while an answer is on
// its way (so focus is never lost); only sending is blocked.
export function AssistantComposer({ isPending, onSend, inputRef }: AssistantComposerProps) {
  const inputId = useId()
  const counterId = useId()

  const form = useAppForm({
    defaultValues: EMPTY_CHAT_FORM as ChatFormInput,
    validators: { onChange: chatFormSchema },
    onSubmit: ({ value, formApi }) => {
      onSend(value.message)
      formApi.reset()
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!isPending) form.handleSubmit()
      }}
      className="flex flex-col gap-1 px-4 pt-3"
    >
      <form.Field name="message">
        {(field) => {
          const length = field.state.value.length
          return (
            <>
              <label htmlFor={inputId} className="sr-only">
                Your question for the care assistant
              </label>
              <div className="flex items-end gap-2">
                <textarea
                  id={inputId}
                  ref={inputRef}
                  name={field.name}
                  rows={1}
                  value={field.state.value}
                  maxLength={AI_CHAT_MAX_MESSAGE_LENGTH}
                  placeholder="Ask about rooms, seats or your bookings"
                  enterKeyHint="send"
                  autoComplete="off"
                  aria-describedby={length >= COUNTER_FROM ? counterId : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                      return
                    }
                    event.preventDefault()
                    if (!isPending) form.handleSubmit()
                  }}
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border-2 border-input bg-card px-4 py-2.5 text-base [field-sizing:content] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
                <form.Subscribe selector={(state) => state.values.message.trim().length > 0}>
                  {(hasText) => (
                    <Button
                      type="submit"
                      size="icon"
                      aria-label="Send message"
                      disabled={!hasText || isPending}
                      className="size-11 rounded-full border-2 border-play-ink bg-play-sun text-play-ink hover:bg-play-sun/80"
                    >
                      <SendHorizontal aria-hidden="true" />
                    </Button>
                  )}
                </form.Subscribe>
              </div>
              {length >= COUNTER_FROM && (
                <p id={counterId} className="text-right text-xs text-muted-foreground">
                  {length} / {AI_CHAT_MAX_MESSAGE_LENGTH}
                </p>
              )}
            </>
          )
        }}
      </form.Field>
    </form>
  )
}
