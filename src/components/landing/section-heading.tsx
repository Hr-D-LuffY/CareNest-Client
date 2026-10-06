import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  // Left-aligned next to a visual, or centred above a grid.
  align?: 'center' | 'start'
  className?: string
}

// Small label, heading and an optional lead paragraph. Shared by every landing section so they
// keep one rhythm.
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      <p className="text-sm font-semibold tracking-wide text-info uppercase">{eyebrow}</p>
      <h2 className="text-3xl text-balance sm:text-4xl">{title}</h2>
      {description && (
        <p className="text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
      )}
    </div>
  )
}
