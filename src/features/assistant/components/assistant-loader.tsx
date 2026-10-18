'use client'

import dynamic from 'next/dynamic'

// The assistant is code the guardian may never open, so it loads after the page, in the browser
// only. A Server Component (the layout) cannot use `ssr: false` itself, hence this small wrapper.
const AssistantWidget = dynamic(
  () => import('./assistant-widget').then((module) => module.AssistantWidget),
  { ssr: false },
)

export function AssistantLoader() {
  return <AssistantWidget />
}
