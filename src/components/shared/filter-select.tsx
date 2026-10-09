import { cn } from '@/lib/utils'

type FilterSelectProps<T extends string> = {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  disabled?: boolean
  // One line under the select, e.g. why it is disabled.
  hint?: string
  className?: string
}

// A labelled native <select> for list filters and sorting. Native, so it is keyboard and screen-
// reader friendly and gets the right picker on phones. Pass '' as an option's value for "Any".
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  hint,
  className,
}: FilterSelectProps<T>) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5 text-sm', className)}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value)
          if (next) onChange(next.value)
        }}
        className="h-10 w-full cursor-pointer pointer-coarse:h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-popover text-popover-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}
