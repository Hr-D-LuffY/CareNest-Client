import type { ReactNode } from 'react'

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

// The top of a public content page (about, services, contact): label, the page's one <h1> and a
// lead paragraph, on the same faint grid as the home page hero.
export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]"
      />
      <div className="page-container flex flex-col gap-4 py-12 sm:py-16">
        <p className="text-sm font-semibold tracking-wide text-info uppercase">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl text-balance sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  )
}
