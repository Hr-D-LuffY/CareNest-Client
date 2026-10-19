'use client'

import { RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAssistantChat } from '../use-assistant-chat'
import { AssistantComposer } from './assistant-composer'
import { AssistantConversation } from './assistant-conversation'
import { AssistantBanner } from './design/assistant-banner'
import { LauncherButton } from './design/launcher-button'

// The guardian's care assistant: a floating button that opens a chat panel. The conversation lives
// in this component, so closing the panel keeps it and only "New chat" clears it.
export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chat = useAssistantChat()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <LauncherButton />

      <SheetContent
        side="right"
        initialFocus={inputRef}
        showCloseButton={false}
        className="gap-0 bg-play-berry-soft p-0 data-[side=right]:h-dvh data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <AssistantBanner>
          {/* The sheet's own close button is a small ghost icon that disappears into the banner. */}
          <SheetClose
            aria-label="Close assistant"
            className="absolute top-3 right-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-card text-foreground shadow-md transition-colors outline-none hover:border-play-ink hover:bg-play-sun hover:text-play-ink focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            <X aria-hidden="true" className="size-5" strokeWidth={3} />
          </SheetClose>
          <SheetHeader className="gap-1 px-4 pt-12 pr-40 pb-14">
            <SheetTitle className="text-2xl">Care assistant</SheetTitle>
            <SheetDescription className="text-foreground/80">
              Answers about CareNest, using your own account data.
            </SheetDescription>
          </SheetHeader>
        </AssistantBanner>

        {chat.thread.length > 0 && (
          <div className="flex justify-end px-4 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={chat.reset}
              disabled={chat.isPending}
              className="h-11 rounded-full bg-card px-4"
            >
              <RotateCcw aria-hidden="true" />
              New chat
            </Button>
          </div>
        )}

        <AssistantConversation
          thread={chat.thread}
          isPending={chat.isPending}
          failure={chat.failure}
          onAsk={chat.send}
          onRetry={chat.retry}
          onNavigate={() => setOpen(false)}
        />

        <div className="rounded-t-[2rem] border-t bg-play-sun-soft pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <AssistantComposer inputRef={inputRef} isPending={chat.isPending} onSend={chat.send} />
          <p className="px-5 pt-2 text-xs text-foreground/70">
            AI can make mistakes, so check details before you book. Your questions are sent to an AI
            service: please don't include health details or passwords.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
