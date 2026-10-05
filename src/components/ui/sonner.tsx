'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

// Soft tinted surface per type, with the status colour carried by the icon and a thin border. The
// message stays in the normal foreground colour, which keeps AA contrast in light and dark mode
// (the red token alone is only 4.2:1 on its tint in light mode).
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success-soft)',
          '--success-text': 'var(--foreground)',
          '--success-border': 'color-mix(in oklab, var(--success) 35%, transparent)',
          '--info-bg': 'var(--info-soft)',
          '--info-text': 'var(--foreground)',
          '--info-border': 'color-mix(in oklab, var(--info) 35%, transparent)',
          '--warning-bg': 'var(--warning-soft)',
          '--warning-text': 'var(--foreground)',
          '--warning-border': 'color-mix(in oklab, var(--warning) 35%, transparent)',
          '--error-bg': 'var(--destructive-soft)',
          '--error-text': 'var(--foreground)',
          '--error-border': 'color-mix(in oklab, var(--destructive) 35%, transparent)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast shadow-card',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
