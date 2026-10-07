'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: LucideIcon
  title: string
  description: ReactNode
  confirmLabel: string
  // The safe choice. Say what it does ("Not yet"), not just "Cancel".
  cancelLabel?: string
  onConfirm: () => void
}

// A "are you sure?" for an action that is final but not destructive, such as one that charges a
// guardian's wallet (check out, end a trip). It looks calm, where ConfirmDialog (cancel, delete) is
// red. Focus is trapped and Escape cancels. The caller closes it.
export function ActionDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
}: ActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-info-soft text-info">
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 px-4">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction className="h-10 px-4" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
