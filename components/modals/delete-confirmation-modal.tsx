'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (permanently: boolean) => void
  title: string
  description: string
  itemName: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [permanently, setPermanently] = useState(false)

  const handleConfirm = () => {
    onConfirm(permanently)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">{title}</AlertDialogTitle>
          <AlertDialogDescription className="pt-4">
            <div className="space-y-4">
              <p>{description}</p>
              <p className="font-semibold text-foreground">Item: {itemName}</p>
              
              {/* Permanent Delete Checkbox */}
              <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
                <Checkbox
                  id="permanent"
                  checked={permanently}
                  onCheckedChange={(checked) => setPermanently(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="permanent"
                  className="text-sm cursor-pointer font-medium text-destructive"
                >
                  Permanently delete (cannot be restored)
                </label>
              </div>

              {!permanently && (
                <p className="text-xs text-muted-foreground italic">
                  This item will be moved to trash and can be restored later.
                </p>
              )}

              {permanently && (
                <p className="text-xs text-destructive font-semibold">
                  ⚠️ Warning: This action cannot be undone!
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={permanently ? 'bg-destructive hover:bg-destructive/90 cursor-pointer' : ''}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
