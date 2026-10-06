import { FileQuestionMark, House } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ErrorScreen } from './error-screen'

type NotFoundViewProps = {
  homeHref: string
  homeLabel: string
  fullPage?: boolean
  description?: string
}

// The body of every not-found.tsx. Inside a dashboard it also covers records that belong to someone
// else: the backend answers 404 for those on purpose, so the wording does not say which it is.
export function NotFoundView({
  homeHref,
  homeLabel,
  fullPage,
  description = 'The page you are looking for does not exist, or it may have moved.',
}: NotFoundViewProps) {
  return (
    <ErrorScreen
      icon={FileQuestionMark}
      eyebrow="404"
      title="Page not found"
      description={description}
      fullPage={fullPage}
    >
      <Link href={homeHref} className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}>
        <House aria-hidden="true" />
        {homeLabel}
      </Link>
    </ErrorScreen>
  )
}
