import { Bus, Hourglass, type LucideIcon, Star } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Three short, true explanations of how the platform works, each linking to where it happens.
const TIPS: readonly {
  href: string
  icon: LucideIcon
  title: string
  text: string
}[] = [
  {
    href: '/dashboard/bookings',
    icon: Bus,
    title: 'Need a ride?',
    text: 'Open a confirmed booking and request a supervised ride to and from the session.',
  },
  {
    href: '/dashboard/rooms',
    icon: Hourglass,
    title: 'Room full?',
    text: 'Your child joins a ranked waitlist and is promoted automatically when a seat opens.',
  },
  {
    href: '/dashboard/bookings',
    icon: Star,
    title: 'Rate your sitter',
    text: 'After a session is completed, leave a rating to help other families choose.',
  },
]

export function GoodToKnow() {
  return (
    <Card className="h-full">
      <CardHeader>
        <h2 className="font-heading text-lg">Good to know</h2>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {TIPS.map(({ href, icon: Icon, title, text }) => (
            <li key={title}>
              <Link
                href={href}
                className="group/tip flex items-start gap-3 rounded-xl p-2 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info-soft text-info"
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold">{title}</span>
                  <span className="text-xs text-pretty text-muted-foreground">{text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
