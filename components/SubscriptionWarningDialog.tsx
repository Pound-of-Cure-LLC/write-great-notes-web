'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface SubscriptionWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'no-subscription' | 'limit-exceeded' | 'inactive'
  usage?: {
    current: number
    limit: number
  } | undefined
}

export function SubscriptionWarningDialog({
  open,
  onOpenChange,
  type,
  usage,
}: SubscriptionWarningDialogProps) {
  const router = useRouter()

  const handleGoToSubscription = () => {
    onOpenChange(false)
    router.push('/settings/subscription')
  }

  const getTitle = () => {
    switch (type) {
      case 'no-subscription':
        return 'No Active Subscription'
      case 'limit-exceeded':
        return 'Monthly Note Limit Reached'
      case 'inactive':
        return 'Subscription Inactive'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'no-subscription':
        return 'You need an active subscription to generate notes. Please subscribe to continue.'
      case 'limit-exceeded':
        return `You've reached your monthly limit of ${usage?.limit || 0} notes. Upgrade your plan to continue generating notes.`
      case 'inactive':
        return 'Your subscription is not active. Please update your payment method or reactivate your subscription.'
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'no-subscription':
        return 'Subscribe Now'
      case 'limit-exceeded':
        return 'Upgrade Plan'
      case 'inactive':
        return 'Manage Subscription'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-950 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {type === 'limit-exceeded' && usage && (
          <div className="rounded-md bg-muted p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Usage</span>
              <span className="text-lg font-bold">
                {usage.current} / {usage.limit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You've used all {usage.limit} notes in your plan this month.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGoToSubscription}>
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
