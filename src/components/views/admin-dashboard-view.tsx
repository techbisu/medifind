'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Shield, Users, Building2, Calendar, Crown, Loader2, CheckCircle2,
  XCircle, Clock, TrendingUp, Star, Eye, Stethoscope, Beaker, PlusCircle,
  Trash2, Pencil, IndianRupee, Activity, AlertCircle
} from 'lucide-react'
import { PROVIDER_TYPE_LABELS } from '@/lib/providers'
import { toast } from 'sonner'

type TabName = 'overview' | 'providers' | 'subscriptions' | 'plans'

export function AdminDashboardView() {
  const { user, setView } = useAppStore()
  const [tab, setTab] = useState<TabName>('overview')

  useEffect(() => {
    if (!user) {
      setView('login')
      return
    }
    if (user.role !== 'ADMIN') {
      setView('home')
      return
    }
  }, [user])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Card>
          <CardContent className="py-12">
            <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">You need admin privileges to access this dashboard.</p>
            <Button onClick={() => setView('login')} className="bg-medical-gradient">Sign In as Admin</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-medical-gradient">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Manage providers, subscriptions, and platform settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={TrendingUp} label="Overview" />
          <TabButton active={tab === 'providers'} onClick={() => setTab('providers')} icon={Users} label="Providers" />
          <TabButton active={tab === 'subscriptions'} onClick={() => setTab('subscriptions')} icon={Crown} label="Subscriptions" />
          <TabButton active={tab === 'plans'} onClick={() => setTab('plans')} icon={IndianRupee} label="Plans" />
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'providers' && <ProvidersTab />}
        {tab === 'subscriptions' && <SubscriptionsTab />}
        {tab === 'plans' && <PlansTab />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function OverviewTab() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
  }

  if (!stats) return null

  const { counts, revenue, tierBreakdown, recentProviders } = stats

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Providers" value={counts.totalProviders} color="text-primary bg-medical-soft" />
        <StatCard icon={Calendar} label="Appointments" value={counts.totalAppointments} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Users} label="Total Users" value={counts.totalUsers} color="text-purple-600 bg-purple-50" />
        <StatCard icon={IndianRupee} label="Revenue (Active)" value={`₹${revenue.toLocaleString('en-IN')}`} color="text-emerald-600 bg-emerald-50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Stethoscope} label="Doctors" value={counts.totalDoctors} color="text-rose-600 bg-rose-50" />
        <StatCard icon={Building2} label="Pharmacies" value={counts.totalShops} color="text-emerald-600 bg-emerald-50" />
        <StatCard icon={Beaker} label="Labs" value={counts.totalLabs} color="text-amber-600 bg-amber-50" />
        <StatCard icon={Star} label="Reviews" value={counts.reviews} color="text-yellow-600 bg-yellow-50" />
      </div>

      {/* Pending approvals */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={counts.pendingProviders > 0 ? 'border-amber-500/40' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">{counts.pendingProviders}</div>
            <p className="text-sm text-muted-foreground mt-1">Providers awaiting review</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => document.querySelector('[value="providers"]')?.click()}>
              Review Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> Pending Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{counts.pendingAppointments}</div>
            <p className="text-sm text-muted-foreground mt-1">Awaiting provider confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {tierBreakdown.map((t: any) => (
              <div key={t.tier} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{t.count}</div>
                <Badge variant="outline" className="mt-1 bg-medical-soft text-primary">{t.tier}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{counts.activeSubscriptions}</span> active subscriptions ·
            <span className="font-medium text-foreground ml-1">₹{revenue.toLocaleString('en-IN')}</span> MRR
          </div>
        </CardContent>
      </Card>

      {/* Recent signups */}
      {recentProviders?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Recent Signups (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProviders.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-medical-soft text-primary text-xs">
                        {p.name.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{PROVIDER_TYPE_LABELS[p.type]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }>{p.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color} mb-2`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function ProvidersTab() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [q, setQ] = useState('')

  const fetchProviders = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    if (q) params.set('q', q)
    params.set('approvedOnly', 'false')
    try {
      const res = await fetch(`/api/admin/providers?${params.toString()}`)
      const data = await res.json()
      setProviders(data.providers || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProviders() }, [statusFilter, typeFilter])

  const updateStatus = async (id: string, status: string, verified?: boolean) => {
    try {
      const body: any = { id, status }
      if (typeof verified === 'boolean') body.verified = verified
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.provider) {
        toast.success(`Provider ${status.toLowerCase()}`)
        fetchProviders()
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <CardTitle className="text-lg">All Providers ({providers.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" onKeyDown={(e) => e.key === 'Enter' && fetchProviders()} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 border rounded-md text-sm">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 border rounded-md text-sm">
              <option value="">All Types</option>
              <option value="DOCTOR">Doctors</option>
              <option value="MEDICAL_SHOP">Pharmacies</option>
              <option value="CLINIC_LAB">Labs</option>
            </select>
            <Button size="sm" variant="outline" onClick={fetchProviders}>Refresh</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No providers found</div>
        ) : (
          <div className="space-y-2 max-h-[700px] overflow-y-auto scroll-thin pr-2">
            {providers.map((p) => (
              <div key={p.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-medical-soft text-primary text-xs">
                        {p.name.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{PROVIDER_TYPE_LABELS[p.type]}</Badge>
                        {p.city && <span>· {p.city}</span>}
                        {p.doctorProfile?.specialty && <span>· {p.doctorProfile.specialty}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      p.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }>{p.status}</Badge>
                    <Badge variant="outline" className="text-[10px] bg-medical-soft text-primary">{p.subscriptionTier}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {p.status === 'PENDING' && (
                    <>
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(p.id, 'APPROVED', true)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => updateStatus(p.id, 'REJECTED')}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {p.status === 'APPROVED' && (
                    <>
                      {!p.verified && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(p.id, 'APPROVED', true)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => updateStatus(p.id, 'SUSPENDED')}>
                        Suspend
                      </Button>
                    </>
                  )}
                  {p.status === 'SUSPENDED' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus(p.id, 'APPROVED')}>
                      Reactivate
                    </Button>
                  )}
                  {(p.status === 'REJECTED') && (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus(p.id, 'APPROVED', true)}>
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionsTab() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/subscriptions')
      .then((r) => r.json())
      .then((d) => setSubs(d.subscriptions || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Subscriptions ({subs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : subs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No subscriptions yet</div>
        ) : (
          <div className="space-y-2 max-h-[700px] overflow-y-auto scroll-thin pr-2">
            {subs.map((s) => (
              <div key={s.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.provider?.name}</span>
                      <Badge variant="outline" className="text-[10px] bg-medical-soft text-primary">{s.plan?.tier}</Badge>
                      <Badge variant="outline" className={
                        s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        s.status === 'EXPIRED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }>{s.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.user?.name} · {s.user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Started: {new Date(s.startDate).toLocaleDateString('en-IN')}
                      {s.endDate && ` · Ends: ${new Date(s.endDate).toLocaleDateString('en-IN')}`}
                      {s.autoRenew && ' · Auto-renew on'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{s.amountPaid}</div>
                    <div className="text-xs text-muted-foreground">{s.plan?.billingCycle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlansTab() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/plans')
      const data = await res.json()
      setPlans((data.plans || []).map((p: any) => ({
        ...p,
        features: typeof p.featuresJson === 'string' ? JSON.parse(p.featuresJson) : p.featuresJson || [],
      })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan? Existing subscriptions will be unaffected.')) return
    await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' })
    toast.success('Plan deleted')
    fetchPlans()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Plans ({plans.length})</CardTitle>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(!showForm) }}>
            <PlusCircle className="h-4 w-4 mr-1" /> New Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <PlanForm plan={editing} onDone={() => { setShowForm(false); setEditing(null); fetchPlans() }} onCancel={() => { setShowForm(false); setEditing(null) }} />
        )}
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {plans.map((p) => (
              <div key={p.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <Badge variant="outline" className="text-[10px] bg-medical-soft text-primary">{p.tier}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(p); setShowForm(true) }} className="p-1 hover:bg-muted rounded">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-bold">₹{p.price}<span className="text-xs font-normal text-muted-foreground">/{p.billingCycle === 'YEARLY' ? 'yr' : 'mo'}</span></div>
                {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                <div className="text-xs text-muted-foreground mt-2">
                  {p._count?.subscriptions || 0} active subscriptions
                </div>
                <div className="flex flex-wrap gap-1 mt-2 text-[10px] text-muted-foreground">
                  <span>Chambers: {p.maxChambers >= 999 ? '∞' : p.maxChambers}</span>
                  <span>·</span>
                  <span>Tests: {p.maxLabTests >= 999 ? '∞' : p.maxLabTests}</span>
                  <span>·</span>
                  <span>Services: {p.maxShopServices >= 999 ? '∞' : p.maxShopServices}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlanForm({ plan, onDone, onCancel }: { plan: any | null; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState(plan?.name || '')
  const [tier, setTier] = useState(plan?.tier || '')
  const [price, setPrice] = useState(plan?.price?.toString() || '0')
  const [billingCycle, setBillingCycle] = useState(plan?.billingCycle || 'MONTHLY')
  const [description, setDescription] = useState(plan?.description || '')
  const [features, setFeatures] = useState((plan?.features || []).join('\n'))
  const [maxChambers, setMaxChambers] = useState(plan?.maxChambers?.toString() || '1')
  const [maxLabTests, setMaxLabTests] = useState(plan?.maxLabTests?.toString() || '5')
  const [maxShopServices, setMaxShopServices] = useState(plan?.maxShopServices?.toString() || '5')
  const [priorityListing, setPriorityListing] = useState(plan?.priorityListing || false)
  const [verifiedBadge, setVerifiedBadge] = useState(plan?.verifiedBadge || false)
  const [isActive, setIsActive] = useState(plan?.isActive ?? true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !tier) { toast.error('Name and tier required'); return }
    setLoading(true)
    try {
      const payload = {
        name, tier, price, billingCycle, description,
        featuresJson: JSON.stringify(features.split('\n').map((s) => s.trim()).filter(Boolean)),
        maxChambers, maxLabTests, maxShopServices, priorityListing, verifiedBadge, isActive,
      }
      const url = plan ? '/api/admin/plans' : '/api/admin/plans'
      const method = plan ? 'PATCH' : 'POST'
      const body = plan ? { id: plan.id, ...payload } : payload
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error) } else { toast.success(plan ? 'Plan updated' : 'Plan created'); onDone() }
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Professional" required />
        </div>
        <div>
          <Label className="text-xs">Tier *</Label>
          <Input value={tier} onChange={(e) => setTier(e.target.value.toUpperCase())} placeholder="PRO" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Price (₹)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Billing Cycle</Label>
          <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full h-9 px-3 border rounded-md text-sm">
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div>
        <Label className="text-xs">Features (one per line)</Label>
        <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} placeholder="Priority listing&#10;Verified badge&#10;Analytics access" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Max Chambers</Label>
          <Input type="number" value={maxChambers} onChange={(e) => setMaxChambers(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Max Lab Tests</Label>
          <Input type="number" value={maxLabTests} onChange={(e) => setMaxLabTests(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Max Services</Label>
          <Input type="number" value={maxShopServices} onChange={(e) => setMaxShopServices(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={priorityListing} onChange={(e) => setPriorityListing(e.target.checked)} />
          Priority Listing
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={verifiedBadge} onChange={(e) => setVerifiedBadge(e.target.checked)} />
          Verified Badge
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-medical-gradient" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
