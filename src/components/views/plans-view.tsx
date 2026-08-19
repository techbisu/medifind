'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  tier: string
  price: number
  billingCycle: string
  description: string | null
  features: string[]
  maxChambers: number
  maxLabTests: number
  maxShopServices: number
  priorityListing: boolean
  verifiedBadge: boolean
  isActive: boolean
  _count?: { subscriptions: number }
}

const TIER_STYLES: Record<string, { gradient: string; badge: string; icon: any; popular?: boolean }> = {
  FREE: { gradient: 'from-slate-50 to-slate-100', badge: 'bg-slate-100 text-slate-700', icon: Sparkles },
  PRO: { gradient: 'from-primary/10 to-primary/5', badge: 'bg-medical-soft text-primary', icon: Crown, popular: true },
  ENTERPRISE: { gradient: 'from-amber-50 to-rose-50', badge: 'bg-amber-100 text-amber-700', icon: Building2 },
}

export function PlansView() {
  const { setView, user } = useAppStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        setPlans((d.plans || []).map((p: any) => ({
          ...p,
          features: typeof p.featuresJson === 'string' ? JSON.parse(p.featuresJson) : p.featuresJson || [],
        })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-medical-soft medical-pattern py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <Badge variant="outline" className="mb-3 bg-background border-primary/30 text-primary">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Plans for every healthcare provider
          </h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-2xl mx-auto">
            Start free and upgrade as you grow. No setup fees, no hidden charges, cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const style = TIER_STYLES[plan.tier] || TIER_STYLES.FREE
              const Icon = style.icon
              const isPopular = style.popular
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden border-2 ${isPopular ? 'border-primary shadow-xl' : 'border-border/60'} bg-gradient-to-b ${style.gradient}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-medical-gradient text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <Badge variant="outline" className={`text-[10px] ${style.badge} border-0`}>{plan.tier}</Badge>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/{plan.billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                    </div>

                    <Button
                      className={`w-full ${isPopular ? 'bg-medical-gradient' : ''}`}
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => {
                        if (!user) {
                          setView('login')
                          toast.info('Please sign in to subscribe')
                        } else if (user.role === 'PUBLIC') {
                          setView('provider-onboarding')
                        } else {
                          setView('provider-dashboard')
                        }
                      }}
                    >
                      {plan.tier === 'FREE' ? 'Start Free' : `Choose ${plan.name}`}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</div>
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Max chambers:</span>
                        <span className="font-medium text-foreground">{plan.maxChambers >= 999 ? 'Unlimited' : plan.maxChambers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max lab tests:</span>
                        <span className="font-medium text-foreground">{plan.maxLabTests >= 999 ? 'Unlimited' : plan.maxLabTests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max services:</span>
                        <span className="font-medium text-foreground">{plan.maxShopServices >= 999 ? 'Unlimited' : plan.maxShopServices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority listing:</span>
                        <span className="font-medium text-foreground">{plan.priorityListing ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified badge:</span>
                        <span className="font-medium text-foreground">{plan.verifiedBadge ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    {plan._count?.subscriptions ? (
                      <div className="text-xs text-center text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 inline mr-1 text-primary" />
                        {plan._count.subscriptions} providers on this plan
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Comparison / FAQ */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <Card className="bg-medical-soft border-primary/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Need help choosing?</h2>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              Our team can help you pick the right plan based on your practice size and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setView('provider-onboarding')} className="bg-medical-gradient">
                Start with Free Plan
              </Button>
              <Button variant="outline" onClick={() => setView('login')}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
