import { SheetTrigger } from '@/components/ui/sheet'
import { SunFace } from './mascots'

// The floating button that opens the assistant: a smiling sun on a coral disc, plus a short label
// from 640 px up. The button's name comes from `aria-label`, so it is the same at every width and
// the visible label can be plain, padded markup (the `sr-only` / `not-sr-only` pair would reset
// the padding to zero).
export function LauncherButton() {
  return (
    <SheetTrigger
      aria-label="Ask the assistant"
      aria-haspopup="dialog"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex cursor-pointer flex-row-reverse items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/60 sm:right-6"
    >
      <span className="animate-play-bob flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-play-ink bg-play-berry shadow-lg">
        <SunFace className="size-12" />
      </span>
      <span
        aria-hidden="true"
        className="hidden rounded-full border-2 border-play-ink bg-play-sun px-6 py-3 text-base leading-none font-bold whitespace-nowrap text-play-ink shadow-md sm:block"
      >
        Ask the assistant
      </span>
    </SheetTrigger>
  )
}
