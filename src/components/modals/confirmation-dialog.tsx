'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  loading = false,
}: ConfirmationDialogProps) {
  // Handle variant colors and icons
  const icons = {
    danger: <AlertCircle className="h-6 w-6 text-destructive" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <Info className="h-6 w-6 text-primary" />,
  }
  
  const confirmButtonStyles = {
    danger: 'bg-destructive hover:bg-destructive/90',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: '',
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icons[variant]}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <Button
            className={confirmButtonStyles[variant]}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
