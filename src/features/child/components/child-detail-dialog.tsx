'use client'

import { HeartPulse, Phone, TriangleAlert, X } from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatAge, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Child } from '@/types'
import { TierBadge } from './child-parts'

type ChildDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  child: Child | null
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length === 0
    ? '?'
    : `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase()
}

// The photo as a wide rounded picture across the top of the modal, so the child's face is seen
// large instead of cropped to a small circle. With no photo (or one that fails to load) it shows
// the initials on the theme gradient, never a placeholder image.
function HeroPhoto({ child }: { child: Child }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)
  const showPhoto = Boolean(child.profilePhoto) && failedPhoto !== child.profilePhoto

  return (
    <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-info-soft via-secondary to-card">
      {showPhoto && child.profilePhoto ? (
        <Image
          src={child.profilePhoto}
          alt={`Photo of ${child.name}`}
          fill
          sizes="(min-width: 640px) 512px, 100vw"
          className="object-cover object-[50%_30%]"
          onError={() => setFailedPhoto(child.profilePhoto)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-heading text-8xl text-info select-none"
        >
          {getInitials(child.name)}
        </span>
      )}
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof HeartPulse
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

// A child's full profile in a modal: the photo large at the top, then everything staff know
// about them. Opened from a card (hover, click or Enter). It only reads: editing is the Edit button on
// the card.
export function ChildDetailDialog({ open, onOpenChange, child }: ChildDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        {child && (
          <div className="relative flex-1 overflow-y-auto">
            <DialogClose
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 z-10 size-10 rounded-full shadow-card"
                />
              }
            >
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <HeroPhoto child={child} />

            <div className="flex flex-col gap-2 px-6 pt-5 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <DialogTitle className="text-2xl leading-tight break-words">
                  {child.name}
                </DialogTitle>
                <TierBadge tier={child.tier} />
              </div>
              <DialogDescription>
                {formatAge(child.dateOfBirth)} · born {formatDate(child.dateOfBirth)}
              </DialogDescription>
            </div>

            <dl className="flex flex-col gap-5 border-t p-6">
              <Detail icon={TriangleAlert} label="Allergies">
                {child.allergies ?? <span className="text-muted-foreground">None noted</span>}
              </Detail>
              <Detail icon={HeartPulse} label="Medical conditions">
                {child.conditions ?? <span className="text-muted-foreground">None noted</span>}
              </Detail>
              <Detail icon={Phone} label="Emergency contact">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">{child.emergencyContactName}</span>
                  <a
                    href={`tel:${child.emergencyContactPhone.replace(/[^\d+]/g, '')}`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
                  >
                    <Phone aria-hidden="true" />
                    {child.emergencyContactPhone}
                    <span className="sr-only"> (call {child.emergencyContactName})</span>
                  </a>
                </div>
              </Detail>
              <p className="text-xs text-muted-foreground">
                Profile added {formatDate(child.createdAt)}
              </p>
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
