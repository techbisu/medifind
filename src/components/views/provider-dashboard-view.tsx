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
import { Separator } from '@/components/ui/separator'
import {
  Building2, Calendar, Settings, PlusCircle, Stethoscope, Pill, Microscope,
  Clock, MapPin, Phone, CheckCircle2, XCircle, Loader2, LayoutDashboard,
  Users, Star, Eye, TrendingUp, Crown, ArrowRight, Trash2, Pencil, X
} from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { PROVIDER_TYPE_LABELS, DAYS_OF_WEEK } from '@/lib/providers'
import { toast } from 'sonner'

type TabName = 'overview' | 'appointments' | 'chambers' | 'listings' | 'subscription'

export function ProviderDashboardView() {
  const { user, setView } = useAppStore()
  const [providers, setProviders] = useState<ProviderDTO[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabName>('overview')

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/providers')
      const data = await res.json()
      setProviders(data.providers || [])
      if (data.providers?.length > 0 && !selectedProviderId) {
        setSelectedProviderId(data.providers[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setView('login')
      return
    }
    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      setView('provider-onboarding')
      return
    }
    fetchProviders()
  }, [user])

  if (!user) return null

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center animate-fade-in">
        <Card>
          <CardContent className="py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-medical-soft mb-4">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first provider listing to start receiving appointments.
            </p>
            <Button onClick={() => setView('provider-onboarding')} className="bg-medical-gradient">
              <PlusCircle className="h-4 w-4 mr-2" /> Create Listing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || providers[0]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Button onClick={() => setView('provider-onboarding')} variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" /> New Listing
        </Button>
      </div>

      {/* Provider selector if multiple */}
      {providers.length > 1 && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition ${selectedProviderId === p.id ? 'bg-medical-gradient text-white border-transparent' : 'hover:bg-muted/50'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={LayoutDashboard} label="Overview" />
          <TabButton active={tab === 'appointments'} onClick={() => setTab('appointments')} icon={Calendar} label="Appointments" />
          {selectedProvider.type === 'DOCTOR' && (
            <TabButton active={tab === 'chambers'} onClick={() => setTab('chambers')} icon={Building2} label="Chambers" />
          )}
          <TabButton
            active={tab === 'listings'}
            onClick={() => setTab('listings')}
            icon={selectedProvider.type === 'CLINIC_LAB' ? Microscope : selectedProvider.type === 'MEDICAL_SHOP' ? Pill : Settings}
            label={selectedProvider.type === 'CLINIC_LAB' ? 'Lab Tests' : selectedProvider.type === 'MEDICAL_SHOP' ? 'Services' : 'Profile'}
          />
          <TabButton active={tab === 'subscription'} onClick={() => setTab('subscription')} icon={Crown} label="Subscription" />
        </div>

        {tab === 'overview' && <OverviewTab provider={selectedProvider} />}
        {tab === 'appointments' && <AppointmentsTab provider={selectedProvider} />}
        {tab === 'chambers' && selectedProvider.type === 'DOCTOR' && <ChambersTab provider={selectedProvider} />}
        {tab === 'listings' && (
          selectedProvider.type === 'CLINIC_LAB' ? <LabTestsTab provider={selectedProvider} /> :
          selectedProvider.type === 'MEDICAL_SHOP' ? <ShopServicesTab provider={selectedProvider} /> :
          <ProfileTab provider={selectedProvider} onUpdate={fetchProviders} />
        )}
        {tab === 'subscription' && <SubscriptionTab provider={selectedProvider} onUpdate={fetchProviders} />}
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

function OverviewTab({ provider }: { provider: ProviderDTO }) {
  const [stats, setStats] = useState({
    appointments: 0,
    pending: 0,
    completed: 0,
  })

  useEffect(() => {
    fetch(`/api/dashboard/appointments?providerId=${provider.id}`)
      .then((r) => r.json())
      .then((d) => {
        const appts = d.appointments || []
        setStats({
          appointments: appts.length,
          pending: appts.filter((a: any) => a.status === 'PENDING').length,
          completed: appts.filter((a: any) => a.status === 'COMPLETED').length,
        })
      })
  }, [provider.id])

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <Card className={`border-l-4 ${provider.status === 'APPROVED' ? 'border-l-emerald-500' : provider.status === 'PENDING' ? 'border-l-amber-500' : 'border-l-rose-500'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{provider.name}</h3>
              <Badge variant="outline" className={provider.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : provider.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                {provider.status}
              </Badge>
              {provider.verified && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{provider.tagline || PROVIDER_TYPE_LABELS[provider.type]}</p>
          </div>
          {provider.status === 'PENDING' && (
            <div className="text-xs text-muted-foreground text-right">
              <Clock className="h-4 w-4 inline mr-1" />
              Under review by admin
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Appointments" value={stats.appointments} color="text-primary bg-medical-soft" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="text-amber-600 bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="text-emerald-600 bg-emerald-50" />
        <StatCard icon={Eye} label="Profile Views" value={provider.viewCount} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Star} label="Rating" value={provider.rating.toFixed(1)} color="text-yellow-600 bg-yellow-50" />
        <StatCard icon={Users} label="Reviews" value={provider.reviewCount} color="text-purple-600 bg-purple-50" />
        <StatCard icon={Crown} label="Plan" value={provider.subscriptionTier} color="text-primary bg-medical-soft" />
        <StatCard icon={TrendingUp} label="Tier" value={provider.subscriptionTier} color="text-rose-600 bg-rose-50" />
      </div>

      {/* Booking Toggle */}
      <BookingToggleCard key={provider.id} provider={provider} />
    </div>
  )
}

function BookingToggleCard({ provider }: { provider: ProviderDTO }) {
  const [enabled, setEnabled] = useState(provider.bookingEnabled !== false)
  const [saving, setSaving] = useState(false)

  const toggle = async () => {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingEnabled: next }),
      })
      const data = await res.json()
      if (data.error) {
        setEnabled(!next) // revert
        toast.error(data.error)
      } else {
        toast.success(next ? 'Online booking enabled' : 'Online booking disabled — patients will see "Call to Book"')
      }
    } catch {
      setEnabled(!next)
      toast.error('Failed to update booking setting')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Online Appointment Booking</h4>
            <Badge variant="outline" className={enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
              {enabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {enabled
              ? 'Patients can book appointments online through your profile. You\'ll receive requests in the Appointments tab.'
              : 'Online booking is disabled. Patients will see your phone number with a "Call to Book" button instead. Useful for walk-in only practices or when you\'re on vacation.'}
          </p>
        </div>
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          className={enabled ? 'bg-medical-gradient' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}
          onClick={toggle}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
          {enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </CardContent>
    </Card>
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

function AppointmentsTab({ provider }: { provider: ProviderDTO }) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchAppts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/appointments?providerId=${provider.id}${filter ? `&status=${filter}` : ''}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppts() }, [provider.id, filter])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (data.appointment) {
        toast.success(`Appointment ${status.toLowerCase()}`)
        fetchAppts()
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg">Appointments ({appointments.length})</CardTitle>
          <div className="flex gap-1 flex-wrap">
            {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <Button
                key={s || 'all'}
                size="sm"
                variant={filter === s ? 'default' : 'outline'}
                className={filter === s ? 'bg-medical-gradient' : 'h-8 text-xs'}
                onClick={() => setFilter(s)}
              >
                {s || 'All'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/40 animate-pulse rounded" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p>No appointments yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto scroll-thin pr-2">
            {appointments.map((a) => (
              <div key={a.id} className="p-3 border rounded-lg hover:bg-muted/30 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-medical-soft text-primary text-xs">
                        {a.patientName.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{a.patientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.patientAge ? `${a.patientAge}y ` : ''}
                        {a.patientGender ? `${a.patientGender} · ` : ''}
                        {a.patientPhone}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={STATUS_COLORS[a.status] || ''}>
                    {a.status}
                  </Badge>
                </div>
                {a.healthIssue && (
                  <div className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">Issue:</span> {a.healthIssue}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(a.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {a.preferredTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {a.preferredTime}
                    </span>
                  )}
                  {a.fee > 0 && <span>₹{a.fee}</span>}
                  {a.chamber && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.chamber.name}</span>}
                </div>
                {a.notes && (
                  <div className="text-xs text-muted-foreground italic mb-2">Note: {a.notes}</div>
                )}
                {a.status === 'PENDING' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(a.id, 'CONFIRMED')}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => updateStatus(a.id, 'CANCELLED')}>
                      <XCircle className="h-3 w-3 mr-1" /> Decline
                    </Button>
                  </div>
                )}
                {a.status === 'CONFIRMED' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(a.id, 'COMPLETED')}>
                      Mark Completed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChambersTab({ provider }: { provider: ProviderDTO }) {
  const [chambers, setChambers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchChambers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/chambers?providerId=${provider.id}`)
      const data = await res.json()
      setChambers(data.chambers || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchChambers() }, [provider.id])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chambers ({chambers.length})</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add Chamber
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <ChamberForm providerId={provider.id} onDone={() => { setShowForm(false); fetchChambers() }} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-muted/40 animate-pulse rounded" />)}
          </div>
        ) : chambers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p>No chambers yet. Add your first chamber to start receiving appointments.</p>
          </div>
        ) : (
          chambers.map((c) => <ChamberCard key={c.id} chamber={c} onUpdate={fetchChambers} />)
        )}
      </CardContent>
    </Card>
  )
}

function ChamberCard({ chamber, onUpdate }: { chamber: any; onUpdate: () => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this chamber? This will also delete all schedules.')) return
    setDeleting(true)
    try {
      await fetch(`/api/dashboard/chambers/${chamber.id}`, { method: 'DELETE' })
      toast.success('Chamber deleted')
      onUpdate()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-medium">{chamber.name}</div>
          {chamber.shop && (
            <Badge variant="outline" className="mt-1 text-[10px] bg-medical-soft text-primary">at {chamber.shop.name}</Badge>
          )}
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-rose-600" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {chamber.address && <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-3 w-3" />{chamber.address}</div>}
      {chamber.visitingHours && <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{chamber.visitingHours}</div>}
      {chamber.schedules?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {chamber.schedules.map((s: any) => (
            <Badge key={s.id} variant="outline" className="text-[10px]">
              {DAYS_OF_WEEK[s.dayOfWeek].slice(0, 3)} {s.startTime}-{s.endTime}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function ChamberForm({ providerId, onDone, onCancel }: { providerId: string; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [visitingHours, setVisitingHours] = useState('')
  const [schedules, setSchedules] = useState<any[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', maxPatients: 10, isAvailable: true },
  ])
  const [loading, setLoading] = useState(false)

  const addSchedule = () => {
    setSchedules([...schedules, { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', maxPatients: 10, isAvailable: true }])
  }
  const updateSchedule = (i: number, field: string, value: any) => {
    const next = [...schedules]
    next[i] = { ...next[i], [field]: value }
    setSchedules(next)
  }
  const removeSchedule = (i: number) => setSchedules(schedules.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error('Chamber name required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/chambers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorProviderId: providerId,
          name, address, phone, city, area, visitingHours, schedules,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Chamber created')
        onDone()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Chamber Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Mehta Private Clinic" required />
        </div>
        <div>
          <Label className="text-xs">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, area" />
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
        </div>
        <div>
          <Label className="text-xs">Area</Label>
          <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Bandra" />
        </div>
        <div>
          <Label className="text-xs">Visiting Hours Summary</Label>
          <Input value={visitingHours} onChange={(e) => setVisitingHours(e.target.value)} placeholder="Mon-Sat 9-1" />
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs">Weekly Schedule</Label>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={addSchedule}>
            <PlusCircle className="h-3 w-3 mr-1" /> Add Slot
          </Button>
        </div>
        <div className="space-y-2">
          {schedules.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-1 items-center">
              <select value={s.dayOfWeek} onChange={(e) => updateSchedule(i, 'dayOfWeek', parseInt(e.target.value))} className="col-span-4 h-8 px-2 text-xs border rounded">
                {DAYS_OF_WEEK.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
              </select>
              <Input type="time" value={s.startTime} onChange={(e) => updateSchedule(i, 'startTime', e.target.value)} className="col-span-3 h-8 text-xs" />
              <Input type="time" value={s.endTime} onChange={(e) => updateSchedule(i, 'endTime', e.target.value)} className="col-span-3 h-8 text-xs" />
              <Input type="number" value={s.maxPatients} onChange={(e) => updateSchedule(i, 'maxPatients', e.target.value)} className="col-span-1 h-8 text-xs" min={1} title="Max patients" />
              <button type="button" onClick={() => removeSchedule(i)} className="col-span-1 h-8 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-medical-gradient" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          Save Chamber
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

function LabTestsTab({ provider }: { provider: ProviderDTO }) {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchTests = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/lab-tests?providerId=${provider.id}`)
      const data = await res.json()
      setTests(data.labTests || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTests() }, [provider.id])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?')) return
    await fetch(`/api/dashboard/lab-tests/${id}`, { method: 'DELETE' })
    toast.success('Test deleted')
    fetchTests()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lab Tests ({tests.length})</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <LabTestForm providerId={provider.id} onDone={() => { setShowForm(false); fetchTests() }} onCancel={() => setShowForm(false)} />
        )}
        {loading ? (
          <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded" />)}</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Microscope className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p>No lab tests yet. Add your first test to showcase your services.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {tests.map((t) => (
              <div key={t.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{t.name}</div>
                    {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{t.category || 'General'}</Badge>
                      <span className="text-sm font-bold">₹{t.discountPrice || t.price}</span>
                      {t.discountPrice && <span className="text-xs text-muted-foreground line-through">₹{t.price}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-rose-600 hover:bg-rose-50 p-1 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LabTestForm({ providerId, onDone, onCancel }: { providerId: string; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [category, setCategory] = useState('')
  const [sampleType, setSampleType] = useState('')
  const [reportTime, setReportTime] = useState('')
  const [fastingRequired, setFastingRequired] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast.error('Test name required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId, name, description, price, discountPrice, category, sampleType, reportTime, fastingRequired,
        }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error) } else { toast.success('Test added'); onDone() }
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-3 space-y-2 bg-muted/30">
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Test Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Complete Blood Count (CBC)" required />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Blood Test" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this test measure?" rows={2} />
      </div>
      <div className="grid sm:grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">Price (₹)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" />
        </div>
        <div>
          <Label className="text-xs">Discount (₹)</Label>
          <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="299" />
        </div>
        <div>
          <Label className="text-xs">Sample</Label>
          <Input value={sampleType} onChange={(e) => setSampleType(e.target.value)} placeholder="Blood" />
        </div>
        <div>
          <Label className="text-xs">Report Time</Label>
          <Input value={reportTime} onChange={(e) => setReportTime(e.target.value)} placeholder="24 hours" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={fastingRequired} onChange={(e) => setFastingRequired(e.target.checked)} />
        Fasting required
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-medical-gradient" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          Add Test
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

function ShopServicesTab({ provider }: { provider: ProviderDTO }) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/shop-services?providerId=${provider.id}`)
      const data = await res.json()
      setServices(data.services || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [provider.id])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/dashboard/shop-services/${id}`, { method: 'DELETE' })
    toast.success('Service deleted')
    fetchServices()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Products & Services ({services.length})</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <ServiceForm providerId={provider.id} onDone={() => { setShowForm(false); fetchServices() }} onCancel={() => setShowForm(false)} />
        )}
        {loading ? (
          <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded" />)}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p>No services yet. Add your products or services to showcase.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {services.map((s) => (
              <div key={s.id} className="border rounded-lg p-3 flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    {s.category && <Badge variant="outline" className="text-[10px]">{s.category}</Badge>}
                    {s.price > 0 && <span className="text-sm font-bold">₹{s.price}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-600 hover:bg-rose-50 p-1 rounded">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ServiceForm({ providerId, onDone, onCancel }: { providerId: string; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast.error('Name required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/shop-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, name, description, price, category }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error) } else { toast.success('Service added'); onDone() }
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-3 space-y-2 bg-muted/30">
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prescription Medicines" required />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Pharmacy" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this service or product?" rows={2} />
      </div>
      <div>
        <Label className="text-xs">Price (₹) - 0 for free/info</Label>
        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-medical-gradient" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          Add Service
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

function ProfileTab({ provider, onUpdate }: { provider: ProviderDTO; onUpdate: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Doctor Profile</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
          <p>Profile editing is available via the API.</p>
          <p className="text-xs mt-2">Provider ID: {provider.id}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionTab({ provider, onUpdate }: { provider: ProviderDTO; onUpdate: () => void }) {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => setPlans((d.plans || []).map((p: any) => ({
        ...p,
        features: typeof p.featuresJson === 'string' ? JSON.parse(p.featuresJson) : p.featuresJson || [],
      }))))
  }, [])

  const subscribe = async (planId: string, tier: string) => {
    if (!confirm(`Switch to ${tier} plan?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider.id, planId }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(`Subscribed to ${tier} plan!`)
        onUpdate()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-medical-soft border-primary/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Current Plan</div>
              <div className="text-xl font-bold">{provider.subscriptionTier}</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-background">{provider.status}</Badge>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = p.tier === provider.subscriptionTier
          return (
            <Card key={p.id} className={`border-2 ${isCurrent ? 'border-primary' : 'border-border/60'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{p.name}</div>
                  {isCurrent && <Badge variant="outline" className="bg-primary/10 text-primary">Current</Badge>}
                </div>
                <div className="text-2xl font-bold mb-2">₹{p.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                <div className="text-xs text-muted-foreground mb-3">{p.description}</div>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loading}
                  onClick={() => subscribe(p.id, p.tier)}
                  size="sm"
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${p.tier}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
