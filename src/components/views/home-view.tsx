'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProviderCard } from '@/components/provider-card'
import {
  Search, MapPin, Stethoscope, Building2, Beaker, PlusCircle,
  Calendar, Shield, Star, Users, ArrowRight, Clock,
  CheckCircle2, Heart, Navigation, Loader2, LocateFixed
} from 'lucide-react'
import { toast } from 'sonner'
import type { ProviderDTO } from '@/lib/providers'

const SPECIALTIES = [
  { name: 'Cardiologist', icon: Heart },
  { name: 'Dermatologist', icon: Users },
  { name: 'Pediatrician', icon: Users },
  { name: 'Orthopedic', icon: PlusCircle },
  { name: 'Dentist', icon: CheckCircle2 },
  { name: 'General Physician', icon: Stethoscope },
]

const TYPE_CARDS = [
  {
    type: 'DOCTOR',
    title: 'Find Doctors',
    description: 'Book appointments with verified specialists near you',
    icon: Stethoscope,
    color: 'bg-rose-50 text-rose-600',
  },
  {
    type: 'MEDICAL_SHOP',
    title: 'Medical Shops',
    description: '24/7 pharmacies with home delivery & doctor chambers',
    icon: Building2,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    type: 'CLINIC_LAB',
    title: 'Clinic & Labs',
    description: 'Diagnostic tests, health packages & imaging centers',
    icon: Beaker,
    color: 'bg-amber-50 text-amber-600',
  },
]

export function HomeView() {
  const { setView, setSearch, runSearch, setUserLocation, setSortBy, userLocation } = useAppStore()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [featured, setFeatured] = useState<ProviderDTO[]>([])
  const [stats, setStats] = useState({ doctors: 0, shops: 0, labs: 0 })
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetch('/api/providers?limit=6')
      .then((r) => r.json())
      .then((d) => setFeatured(d.providers || []))
      .catch(() => {})
    fetch('/api/providers?limit=1&type=DOCTOR').then(r => r.json()).then(d => setStats(s => ({ ...s, doctors: d.total || 0 })))
    fetch('/api/providers?limit=1&type=MEDICAL_SHOP').then(r => r.json()).then(d => setStats(s => ({ ...s, shops: d.total || 0 })))
    fetch('/api/providers?limit=1&type=CLINIC_LAB').then(r => r.json()).then(d => setStats(s => ({ ...s, labs: d.total || 0 })))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(query, '', city)
    runSearch()
  }

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude, label: 'Current location' })
        setLocating(false)
        setSortBy('distance')
        setSearch('', '')
        runSearch()
        toast.success('Location set — showing nearest providers')
      },
      (err) => {
        setLocating(false)
        const msg = err.code === 1
          ? 'Location permission denied. Please allow location access.'
          : 'Could not get your location. Please try again.'
        toast.error(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-medical-soft medical-pattern">
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-background/80 border-primary/30 text-primary">
              <PlusCircle className="h-3 w-3 mr-1" />
              India&apos;s Trusted Health Network
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Find the right <span className="text-medical-gradient">doctor</span>,<br />
              <span className="text-medical-gradient">pharmacy</span> or <span className="text-medical-gradient">lab</span> near you
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Book appointments with verified specialists, order medicines from nearby pharmacies, and get lab tests done — all in one place. Free for patients, simple for providers.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mt-8 bg-background rounded-2xl shadow-lg border border-border/60 p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Doctor name, specialty, or condition"
                  className="pl-9 h-12 border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="pl-9 h-12 border-0 shadow-none focus-visible:ring-0 sm:border-l sm:border-l-border"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-medical-gradient">
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </form>

            {/* Use My Location button */}
            <div className="mt-3 flex justify-center">
              {userLocation ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-medical-soft/40 border-primary/40 text-primary"
                  onClick={() => { setSearch('', ''); setSortBy('distance'); runSearch() }}
                >
                  <LocateFixed className="h-4 w-4 mr-1.5" />
                  Continue with my location ({userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)})
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-medical-soft"
                  onClick={useMyLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Detecting your location...</>
                  ) : (
                    <><Navigation className="h-4 w-4 mr-1.5" /> Use my current location instead</>
                  )}
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> 100% Verified Profiles</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> Real-time Availability</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /> Secure & Private</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatCard icon={Stethoscope} label="Doctors" value={stats.doctors} color="text-rose-600 bg-rose-50" />
            <StatCard icon={Building2} label="Pharmacies" value={stats.shops} color="text-emerald-600 bg-emerald-50" />
            <StatCard icon={Beaker} label="Diagnostic Labs" value={stats.labs} color="text-amber-600 bg-amber-50" />
            <StatCard icon={Calendar} label="Appointments" value="10K+" color="text-primary bg-medical-soft" />
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">What are you looking for?</h2>
          <p className="text-muted-foreground mt-1">Browse our network of healthcare providers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TYPE_CARDS.map((cat) => {
            const Icon = cat.icon
            return (
              <Card
                key={cat.type}
                className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all group"
                onClick={() => { setSearch('', cat.type); runSearch(); }}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Browse now <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Popular Specialties</h2>
          <p className="text-muted-foreground mt-1">Quick access to top medical specialists</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPECIALTIES.map((spec) => {
            const Icon = spec.icon
            return (
              <Button
                key={spec.name}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-medical-soft hover:border-primary/40 hover:text-primary"
                onClick={() => { setSearch(spec.name, 'DOCTOR'); runSearch(); }}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium text-center">{spec.name}</span>
              </Button>
            )
          })}
        </div>
      </section>

      {/* Featured Providers */}
      {featured.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Top Rated Providers</h2>
              <p className="text-muted-foreground mt-1">Featured verified providers in our network</p>
            </div>
            <Button variant="outline" onClick={() => { setSearch('', ''); runSearch(); }}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}

      {/* Provider CTA */}
      <section className="bg-medical-gradient text-white">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                For Healthcare Providers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Grow your practice with MediFind
              </h2>
              <p className="text-white/90 text-base md:text-lg mb-6">
                List your clinic, pharmacy, or lab on our platform. Reach thousands of patients actively searching for healthcare services. Get started free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => setView('provider-onboarding')}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> List Your Practice — Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setView('plans')}
                >
                  View Plans
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard icon={Users} title="10K+ Patients" description="Active monthly users searching for care" />
              <FeatureCard icon={Calendar} title="Easy Booking" description="Manage appointments in one dashboard" />
              <FeatureCard icon={Star} title="Boost Visibility" description="Priority placement on Pro plans" />
              <FeatureCard icon={Shield} title="Verified Badge" description="Build trust with patients" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How MediFind Works</h2>
          <p className="text-muted-foreground mt-1">Three simple steps to better healthcare</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            step="01"
            icon={Search}
            title="Search & Compare"
            description="Find doctors, pharmacies, or labs by specialty, location, or health condition. Compare ratings, fees, and reviews."
          />
          <StepCard
            step="02"
            icon={Calendar}
            title="Book Appointment"
            description="Pick a time slot that works for you. Get instant confirmation. No phone calls needed."
          />
          <StepCard
            step="03"
            icon={Heart}
            title="Get Care"
            description="Visit the provider, get your prescription, tests, or consultation. Leave a review to help others."
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <Icon className="h-6 w-6 mb-2" />
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-white/80 mt-1">{description}</div>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, description }: { step: string; icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-border/40">
      <CardContent className="p-6">
        <div className="absolute -top-2 -right-2 text-7xl font-bold text-primary/5 select-none">{step}</div>
        <div className="relative">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-medical-soft text-primary mb-4">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
