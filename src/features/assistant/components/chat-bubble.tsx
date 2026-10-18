import { cn } from '@/lib/utils'
import type { ThreadEntry } from '../use-assistant-chat'
import { SunFace } from './design/mascots'

// One turn of the conversation. The text is rendered as plain text (line breaks kept), never as
// HTML, so nothing a model writes can inject markup. Bubbles have solid backgrounds, so the text
// reads the same whatever is drawn behind the panel. The assistant's turns carry its little sun.
export function ChatBubble({ entry }: { entry: ThreadEntry }) {
  const isGuardian = entry.role === 'user'

  return (
    <div className={cn('flex items-end gap-2', isGuardian ? 'justify-end' : 'justify-start')}>
      {!isGuardian && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-play-ink bg-play-sun-soft">
          <SunFace still className="size-7" />
        </span>
      )}
      <div
        className={cn(
          'max-w-[82%] px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm',
          isGuardian
            ? 'rounded-3xl rounded-br-md bg-play-berry text-play-ink'
            : 'rounded-3xl rounded-bl-md border bg-card text-card-foreground',
        )}
      >
        <span className="sr-only">{isGuardian ? 'You said: ' : 'Assistant said: '}</span>
        {entry.content}
      </div>
    </div>
  )
}
