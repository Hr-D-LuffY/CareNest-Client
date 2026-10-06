'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useEffectEvent, useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type SearchInputProps = {
  // The search text now in the URL.
  value: string
  // Called with the trimmed text once typing pauses (or on Enter, or Clear). '' means "no search".
  onSearch: (text: string) => void
  // Read by screen readers; the visible hint is the placeholder.
  label: string
  placeholder: string
  className?: string
}

// A search box for list pages. The input follows every keystroke; the URL (and so the request)
// follows after the typing pauses. When the URL changes from outside (a "Clear filters" button, the
// back button) the box shows the new text.
export function SearchInput({ value, onSearch, label, placeholder, className }: SearchInputProps) {
  const id = useId()
  const [text, setText] = useState(value)
  const [shownValue, setShownValue] = useState(value)
  const debounced = useDebounce(text)

  // The URL changed. If it is not just the text this box sent a moment ago, show it. (Comparing
  // with the debounced text, not the live text, keeps letters typed since then.)
  if (value !== shownValue) {
    setShownValue(value)
    if (value !== debounced.trim()) setText(value)
  }

  const send = useEffectEvent((next: string) => {
    if (next !== value) onSearch(next)
  })
  useEffect(() => {
    send(debounced.trim())
  }, [debounced])

  function clear() {
    setText('')
    onSearch('')
  }

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        type="search"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // Enter searches now. It must not also submit a form this box sits inside.
            event.preventDefault()
            onSearch(text.trim())
          }
        }}
        className="h-11 rounded-xl pr-11 pl-11 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  )
}
