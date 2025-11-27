'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiGet, apiPost } from '@/lib/api-client'
import { AppLayout } from '@/components/AppLayout'
import { CreditCard, FileText, Calendar, Check, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isProviderOrAdmin } from '@/lib/roles'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useUserProfile } from '@/lib/use-user-profile'

import { logger } from "@/lib/logger";
type Subscription = {
  id: string
  status: string
  subscription_tier: string
  plan_id: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
}

type PaymentMethod = {
  id: string
  type: string
  last4: string
  brand: string
  exp_month?: number
  exp_year?: number
}

type Invoice = {
  id: string
  amount: number
  status: string
  created_at: string
  invoice_url: string | null
  invoice_pdf: string | null
}

type UsageStats = {
  billable_usage: number
  transcription_count: number
  note_count: number
  limit: number | null
  period_start: string
}

type CheckoutResponse = {
  checkout_url: string
}

type BillingPortalResponse = {
  portal_url: string
}

type SidebarSection = 'plan' | 'usage' | 'payment-methods' | 'invoices'

// Subscription tier constants
const TIER_INFO = {
  limited: {
    name: 'Limited',
    price: 99,
    notes: 100,
    features: [
      'Up to 100 notes/month',
      'Single provider',
      'Basic note generation',
      'Standard support',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    price: 129,
    notes: 750,
    features: [
      'Up to 750 notes/month',
      'Single provider',
      'Advanced AI instructions',
      'Priority support',
    ],
  },
}

function SubscriptionSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section') as SidebarSection | null
  const [activeSection, setActiveSection] = useState<SidebarSection>(
    sectionParam && ['plan', 'usage', 'payment-methods', 'invoices'].includes(sectionParam)
      ? sectionParam
      : 'plan'
  )

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Use SWR hook for user profile (instant render from cache, no shuffling)
  const { data: profile, isLoading: checkingAccess } = useUserProfile()

  // Ensure hydration consistency - only check access after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !checkingAccess) {
      fetchSubscription()
      fetchUsage()
      fetchPaymentMethods()
      fetchInvoices()
    }
  }, [mounted, checkingAccess])

  // Check for success/canceled query params from Stripe redirect
  useEffect(() => {
    const successParam = searchParams.get('success')
    const canceledParam = searchParams.get('canceled')

    if (successParam === 'true') {
      setSuccess('Subscription activated successfully!')
      setTimeout(() => setSuccess(''), 5000)
      // Refresh subscription data
      fetchSubscription()
      fetchUsage()
    } else if (canceledParam === 'true') {
      setError('Subscription setup was canceled')
      setTimeout(() => setError(''), 5000)
    }
  }, [searchParams])

  const fetchSubscription = async () => {
    try {
      const data = await apiGet<Subscription>('/billing/subscription')
      setSubscription(data)
    } catch (err) {
      logger.error('Failed to fetch subscription', err)
    }
  }

  const fetchUsage = async () => {
    try {
      const data = await apiGet<UsageStats>('/billing/usage')
      setUsage(data)
    } catch (err) {
      logger.error('Failed to fetch usage', err)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const data = await apiGet<PaymentMethod[]>('/billing/payment-methods')
      setPaymentMethods(data)
    } catch (err) {
      logger.error('Failed to fetch payment methods', err)
    }
  }

  const fetchInvoices = async () => {
    try {
      const data = await apiGet<Invoice[]>('/billing/invoices')
      setInvoices(data)
    } catch (err) {
      logger.error('Failed to fetch invoices', err)
    }
  }

  const handleSelectPlan = (tier: string) => {
    setSelectedTier(tier)

    // Check if this is an upgrade (user already has a subscription)
    if (subscription && subscription.status === 'active') {
      // Direct upgrade - no trial, prorated billing
      handleUpgrade(tier)
    } else {
      // New subscription - show trial dialog
      setConfirmDialogOpen(true)
    }
  }

  const handleUpgrade = async (tier: string) => {
    setLoading(true)
    setError('')

    try {
      await apiPost('/billing/upgrade', { tier })

      setSuccess(`Successfully upgraded to ${TIER_INFO[tier as keyof typeof TIER_INFO]?.name}! You've been charged the prorated difference.`)

      // Refresh subscription data
      await fetchSubscription()

      setTimeout(() => setSuccess(''), 5000)
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('already on this plan')) {
        setError('You are already on this plan.')
      } else {
        const message = err instanceof Error ? err.message : 'Failed to upgrade subscription'
        setError(message)
      }
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPurchase = async () => {
    if (!selectedTier) return

    setLoading(true)
    setError('')
    setConfirmDialogOpen(false)

    try {
      const data = await apiPost<CheckoutResponse>('/billing/checkout', {
        tier: selectedTier,
      })

      // Redirect to Stripe checkout
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session'
      setError(message)
      setLoading(false)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await apiGet<BillingPortalResponse>('/billing/portal')
      // Open Stripe customer portal in new tab
      window.open(data.portal_url, '_blank', 'noopener,noreferrer')
      setLoading(false)
    } catch (err: unknown) {
      // Show user-friendly error message
      const isConfigError = (err instanceof Error && err.message?.includes('not yet configured')) ||
                           (typeof err === 'object' && err !== null && 'status' in err && err.status === 503);
      if (isConfigError) {
        setError('The billing portal is being set up. Please contact support at support@writegreatnotes.ai to manage your subscription.')
      } else {
        const message = err instanceof Error ? err.message : 'Failed to open billing portal'
        setError(message)
      }
      setLoading(false)
      setTimeout(() => setError(''), 10000) // Show error longer for contact info
    }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    setError('')

    try {
      await apiPost('/billing/cancel', {})

      setSuccess('Your subscription will be cancelled at the end of the current billing period.')
      setCancelDialogOpen(false)

      // Refresh subscription to show updated status
      await fetchSubscription()

      setTimeout(() => setSuccess(''), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setCancelling(false)
    }
  }

  const usagePercentage = usage && usage.limit ? (usage.billable_usage / usage.limit) * 100 : 0

  // Show access denied message for non-provider/admin users (only after mount to avoid hydration issues)
  if (mounted && !checkingAccess && !isProviderOrAdmin(profile?.roles || [])) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
                <CardTitle>Access Restricted</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Only providers and administrators can manage subscriptions. Please contact your organization administrator if you need to update subscription settings.
              </p>
              <Button onClick={() => router.push('/appointments')}>
                Go to Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Show loading state only before mount or while checking access
  if (!mounted || checkingAccess) {
    return (
      <AppLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Subscription & Billing</h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, usage, and billing information
        </p>
      </div>

      {/* Tabs for section switching */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SidebarSection)} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="plan"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Calendar className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Subscription Plan</span>
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Usage</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment-methods"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <CreditCard className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Payment Methods</span>
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Invoices</span>
          </TabsTrigger>
        </TabsList>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

        {/* Subscription Plan Section */}
        <TabsContent value="plan">
          {/* Current Plan */}
          {subscription && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your organization's active subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Legacy Enterprise Warning */}
                {!TIER_INFO[subscription.subscription_tier as keyof typeof TIER_INFO] && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 mb-4">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      ⚠️ Legacy Plan: {subscription.subscription_tier}
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      This plan is no longer available for new subscriptions. Please contact support if you need to make changes.
                    </p>
                  </div>
                )}

                <div className="rounded-md border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold capitalize">
                        {TIER_INFO[subscription.subscription_tier as keyof typeof TIER_INFO]?.name || subscription.subscription_tier}
                      </h3>
                      {TIER_INFO[subscription.subscription_tier as keyof typeof TIER_INFO]?.price && (
                        <p className="text-lg font-semibold mt-2">
                          ${TIER_INFO[subscription.subscription_tier as keyof typeof TIER_INFO].price}/month
                        </p>
                      )}
                    </div>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {subscription.status}
                    </Badge>
                  </div>

                  {subscription.current_period_end && (
                    <div className="space-y-2 text-sm border-t pt-4 mb-4">
                      <p>
                        <span className="text-muted-foreground">Next billing date:</span>{' '}
                        <span className="font-medium">
                          {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                      {subscription.cancel_at_period_end && (
                        <p className="text-destructive font-medium">
                          ⚠ Your subscription will be cancelled at the end of the current period
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
                      {loading ? 'Loading...' : 'Manage Payment & Billing'}
                    </Button>
                    {!subscription.cancel_at_period_end && (
                      <Button variant="destructive" onClick={() => setCancelDialogOpen(true)} disabled={loading}>
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>{subscription ? 'Upgrade Your Plan' : 'Choose a Plan'}</CardTitle>
              <CardDescription>
                {subscription
                  ? 'Unlock more features and capacity with an upgrade'
                  : 'Select the plan that works best for your organization'
                }
              </CardDescription>
              {!subscription && (
                <div className="mt-4 rounded-lg bg-primary/10 border-2 border-primary p-4 text-center">
                  <p className="text-lg font-bold text-primary">🎉 Start Your 7-Day Free Trial Today!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You won't be charged until your trial ends. Cancel anytime.
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className={cn(
                "grid gap-6",
                subscription?.subscription_tier === 'limited' ? 'md:grid-cols-1 max-w-md' :
                subscription?.subscription_tier === 'unlimited' ? 'md:grid-cols-1 max-w-md' :
                'md:grid-cols-2'
              )}>
                {/* Limited Plan - Only show if no subscription */}
                {!subscription && (
                <div className={cn(
                  "rounded-lg border-2 p-6 transition-all border-border hover:border-primary/50"
                )}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{TIER_INFO.limited.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${TIER_INFO.limited.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {TIER_INFO.limited.notes} notes per month
                    </p>
                    {!subscription && (
                      <Badge variant="secondary" className="mt-2">
                        7-Day Free Trial
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {TIER_INFO.limited.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan('limited')}
                    disabled={loading}
                  >
                    Select Plan
                  </Button>
                </div>
                )}

                {/* Unlimited Plan - Show if no subscription OR if on Limited plan */}
                {(!subscription || subscription.subscription_tier === 'limited') && (
                <div className={cn(
                  "rounded-lg border-2 p-6 transition-all relative",
                  subscription?.subscription_tier === 'unlimited'
                    ? "border-primary bg-primary/5"
                    : "border-primary hover:border-primary"
                )}>
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-md">
                    POPULAR
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{TIER_INFO.unlimited.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${TIER_INFO.unlimited.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {TIER_INFO.unlimited.notes} notes per month
                    </p>
                    {!subscription && (
                      <Badge variant="secondary" className="mt-2">
                        7-Day Free Trial
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {TIER_INFO.unlimited.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan('unlimited')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : subscription?.subscription_tier === 'limited' ? 'Upgrade to Unlimited' : 'Select Plan'}
                  </Button>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Section */}
        <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Current billing period usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usage ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Notes Generated</span>
                    <span className="text-sm text-muted-foreground">
                      {usage.billable_usage} / {usage.limit === null ? '∞' : usage.limit}
                    </span>
                  </div>
                  {usage.limit && (
                    <>
                      <Progress value={usagePercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {usagePercentage.toFixed(1)}% of monthly limit
                      </p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Transcriptions</p>
                    <p className="text-2xl font-bold">{usage.transcription_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notes Created</p>
                    <p className="text-2xl font-bold">{usage.note_count}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Billing Period</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(usage.period_start).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} - {subscription?.current_period_end && new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {usagePercentage > 80 && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-medium">⚠ Approaching usage limit</p>
                    <p className="mt-1">
                      You've used {usagePercentage.toFixed(0)}% of your monthly notes. Consider upgrading your plan.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading usage data...</p>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Payment Methods Section */}
        <TabsContent value="payment-methods">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your organization's payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment methods on file</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{pm.brand} •••• {pm.last4}</p>
                        {pm.exp_month && pm.exp_year && (
                          <p className="text-sm text-muted-foreground">
                            Expires {pm.exp_month}/{pm.exp_year}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleManageBilling} disabled={loading}>
                {loading ? 'Loading...' : 'Manage Payment Methods'}
              </Button>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Invoices Section */}
        <TabsContent value="invoices">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Your organization's billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-md border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          ${(invoice.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} •{' '}
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="capitalize ml-1">
                            {invoice.status}
                          </Badge>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {invoice.invoice_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={invoice.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </Button>
                        )}
                        {invoice.invoice_pdf && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Your Free Trial</DialogTitle>
            <DialogDescription>
              You're about to start a 7-day free trial of the {selectedTier && TIER_INFO[selectedTier as keyof typeof TIER_INFO]?.name} plan.
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="py-4">
              <div className="rounded-md bg-primary/10 border border-primary p-4 mb-4">
                <p className="font-bold text-primary text-center">🎉 7-Day Free Trial</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Enter your payment details to start your trial. You won't be charged until the trial ends.
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {TIER_INFO[selectedTier as keyof typeof TIER_INFO]?.name} Plan
                  </span>
                  <span className="text-lg font-bold">
                    ${TIER_INFO[selectedTier as 'limited' | 'unlimited']?.price}/month
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Up to {TIER_INFO[selectedTier as 'limited' | 'unlimited']?.notes} notes per month
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={loading}>
              {loading ? 'Processing...' : 'Start Free Trial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 mb-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                What happens next:
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-200 mt-2 space-y-1 list-disc list-inside">
                {subscription?.current_period_end ? (
                  <li>
                    Your subscription will remain active until{' '}
                    <strong>
                      {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </strong>
                  </li>
                ) : (
                  <li>Your subscription will be cancelled at the end of the current billing period</li>
                )}
                <li>You can continue to use all features until then</li>
                <li>You won't be charged again</li>
                <li>You can reactivate anytime before the end date</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

export default function SubscriptionSettingsPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Subscription & Billing</h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    }>
      <SubscriptionSettingsContent />
    </Suspense>
  )
}
