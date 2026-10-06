'use client'

import './globals.css'

// The last safety net: it replaces the root layout when that layout itself crashes, so it has to
// bring its own <html> and <body>, and it cannot use the theme provider, fonts or any component that
// needs a provider. Plain markup and the global tokens only. It matches the default (dark) theme.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl">CareNest ran into a problem</h1>
          <p className="max-w-md text-base text-muted-foreground">
            Something broke while loading the app. Try again, or go back to the home page. If the
            backend was asleep, it can take up to a minute to wake.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => retry()}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Back to home
            </a>
          </div>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error reference: <span className="font-mono">{error.digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
