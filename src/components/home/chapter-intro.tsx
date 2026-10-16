import { Reveal } from '@/components/motion/reveal'

type ChapterIntroProps = {
  number: number
  // The chapter's short name, shown next to "Chapter n".
  name: string
  // Written like a narrator: the line that carries you from the last chapter into this one.
  title: string
  text: string
}

// The opening of a chapter: a large faint number, the chapter name, then one narrating sentence and
// a line of explanation. Every chapter starts the same way, so scrolling reads like turning pages.
export function ChapterIntro({ number, name, title, text }: ChapterIntroProps) {
  return (
    <Reveal className="page-container pt-20 sm:pt-28">
      <div className="flex items-start gap-5 sm:gap-8">
        <span
          aria-hidden="true"
          className="font-heading text-6xl leading-none text-muted-foreground/30 tabular-nums sm:text-8xl"
        >
          {String(number).padStart(2, '0')}
        </span>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-info uppercase">
            Chapter {number} · {name}
          </p>
          <h2 className="mt-2 text-3xl text-balance sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">{text}</p>
        </div>
      </div>
    </Reveal>
  )
}
