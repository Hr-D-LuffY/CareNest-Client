'use client'

import dynamic from 'next/dynamic'

// The assistant is code the guardian may never open, so it loads after the page, in the browser
// only. A Server Component (the layout) cannot use `ssr: false` itself, hence this small wrapper.
// If the file cannot be fetched (a dropped connection, a stale deploy) the button is simply left
// out: the assistant is optional, and the dashboard must not fall into its error screen over it.
const AssistantWidget = dynamic(
  () =>
    import('./assistant-widget').then((module) => module.AssistantWidget).catch(() => () => null),
  { ssr: false },
)

export function AssistantLoader() {
  return <AssistantWidget />
}
