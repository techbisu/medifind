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
  CheckCircle2, Heart, Navigation, Loader2, LocateFixed,
  UserCheck, Zap, Phone
} from 'lucide-react'
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
    title: 'Doctors',
    description: 'Book appointments with verified specialists',
    icon: Stethoscope,
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
    accent: 'group-hover:bg-rose-100 dark:group-hover:bg-rose-950/50',
  },
  {
    type: 'MEDICAL_SHOP',
    title: 'Pharmacies',
    description: '24/7 pharmacies with home delivery & doctor chambers',
    icon: Building2,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    accent: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50',
  },
  {
    type: 'CLINIC_LAB',
    title: 'Clinic & Labs',
    description: 'Diagnostic tests, health packages & imaging centers',
    icon: Beaker,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    accent: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-950/50',
  },
]

const TRUST_SIGNALS = [
  {
    icon: UserCheck,
    title: 'Verified Providers',
    description: 'Every provider is verified by MediFind',
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book appointments online in under a minute',
  },
  {
    icon: Navigation,
    title: 'Nearby Discovery',
    description: 'Find healthcare providers near you instantly',
  },
  {
    icon: Shield,
    title: 'No Account Needed',
    description: 'Book without creating an account — your privacy first',
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
      },
      () => { setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  const totalProviders = stats.doctors + stats.shops + stats.labs

  return (
    <div className="animate-fade-in">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-medical-soft via-background to-medical-soft dot-grid">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-background/80 border-primary/30 text-primary backdrop-blur-sm">
              <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
              India&apos;s Trusted Health Network
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Find Trusted<br />
              <span className="text-medical-gradient">Healthcare Near You</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover verified doctors, pharmacies, clinics and diagnostic labs — all in one place. Book appointments, order medicines, get lab tests done.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mt-8 bg-background rounded-2xl shadow-lg border border-border/60 p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto" role="search">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Doctor, specialty, or condition"
                  className="pl-9 h-12 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                  aria-label="Search query"
                />
              </div>
              <div className="relative sm:w-44">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="pl-9 h-12 border-0 shadow-none focus-visible:ring-0 sm:border-l sm:border-l-border bg-transparent"
                  aria-label="City filter"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-medical-gradient shadow-md hover:shadow-lg transition-shadow">
                <Search className="h-4 w-4 mr-1" aria-hidden="true" />
                Search
              </Button>
            </form>

            {/* Use My Location */}
            <div className="mt-4 flex justify-center">
              {userLocation ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-medical-soft/40 border-primary/40 text-primary"
                  onClick={() => { setSearch('', ''); setSortBy('distance'); runSearch() }}
                >
                  <LocateFixed className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Continue with my location
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
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> Detecting...</>
                  ) : (
                    <><Navigation className="h-4 w-4 mr-1.5" aria-hidden="true" /> Use my current location</>
                  )}
                </Button>
              )}
            </div>

            {/* Popular searches */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Popular:</span>
              {['Cardiologist', 'Dermatologist', 'Pediatrician', 'Pharmacy', 'Lab Test'].map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearch(term, ''); runSearch() }}
                  className="px-3 py-1 text-xs font-medium rounded-full border border-border/60 bg-background/60 hover:bg-medical-soft hover:border-primary/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatCard icon={Stethoscope} label="Doctors" value={stats.doctors} color="text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400" />
            <StatCard icon={Building2} label="Pharmacies" value={stats.shops} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" />
            <StatCard icon={Beaker} label="Diagnostic Labs" value={stats.labs} color="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400" />
            <StatCard icon={Calendar} label="Appointments" value="10K+" color="text-primary bg-medical-soft" />
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST SIGNALS
          ============================================================ */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_SIGNALS.map((signal, idx) => {
            const Icon = signal.icon
            return (
              <Card key={idx} className="border-border/40 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-medical-soft text-primary mb-3">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{signal.title}</h3>
                  <p className="text-xs text-muted-foreground">{signal.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ============================================================
          PROVIDER CATEGORIES
          ============================================================ */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">What are you looking for?</h2>
          <p className="text-muted-foreground mt-1">Browse our network of healthcare providers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TYPE_CARDS.map((cat) => {
            const Icon = cat.icon
            const count = cat.type === 'DOCTOR' ? stats.doctors : cat.type === 'MEDICAL_SHOP' ? stats.shops : stats.labs
            return (
              <Card
                key={cat.type}
                className="cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group"
                onClick={() => { setSearch('', cat.type); runSearch() }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearch('', cat.type); runSearch() } }}
                aria-label={`Browse ${cat.title}`}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} ${cat.accent} transition-colors mb-4`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{cat.title}</h3>
                    {count > 0 && (
                      <Badge variant="outline" className="text-[10px] bg-muted/50">{count}+</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Browse now <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ============================================================
          POPULAR SPECIALTIES
          ============================================================ */}
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
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-medical-soft hover:border-primary/40 hover:text-primary transition-all"
                onClick={() => { setSearch(spec.name, 'DOCTOR'); runSearch() }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs font-medium text-center">{spec.name}</span>
              </Button>
            )
          })}
        </div>
      </section>

      {/* ============================================================
          FEATURED PROVIDERS
          ============================================================ */}
      {featured.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Top Rated Providers</h2>
              <p className="text-muted-foreground mt-1">Featured verified providers in our network</p>
            </div>
            <Button variant="outline" onClick={() => { setSearch('', ''); runSearch() }}>
              View All <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          PROVIDER CTA
          ============================================================ */}
      <section className="bg-medical-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl px-4 py-16 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                For Healthcare Providers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Grow your practice with MediFind
              </h2>
              <p className="text-white/90 text-base md:text-lg mb-6 leading-relaxed">
                List your clinic, pharmacy, or lab. Reach thousands of patients actively searching for healthcare. Get started free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  onClick={() => setView('provider-onboarding')}
                >
                  <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  List Your Practice — Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
                  onClick={() => setView('plans')}
                >
                  View Plans
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard icon={Users} title="10K+ Patients" description="Active monthly users searching" />
              <FeatureCard icon={Calendar} title="Easy Booking" description="Manage appointments in one dashboard" />
              <FeatureCard icon={Star} title="Boost Visibility" description="Priority placement on Pro plans" />
              <FeatureCard icon={Shield} title="Verified Badge" description="Build trust with patients" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How MediFind Works</h2>
          <p className="text-muted-foreground mt-1">Three simple steps to better healthcare</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard step="01" icon={Search} title="Search & Compare" description="Find doctors, pharmacies, or labs by specialty, location, or condition. Compare ratings, fees, and reviews." />
          <StepCard step="02" icon={Calendar} title="Book Appointment" description="Pick a time slot that works for you. Get instant confirmation. No phone calls needed." />
          <StepCard step="03" icon={Heart} title="Get Care" description="Visit the provider, get your prescription, tests, or consultation. Leave a review to help others." />
        </div>
      </section>

      {/* ============================================================
          FAQ SECTION (SEO)
          ============================================================ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-1">Everything you need to know about MediFind</p>
        </div>
        <div className="space-y-4">
          <FaqItem
            question="How do I find a doctor near me?"
            answer="Use the search bar on our homepage and click 'Use my current location' to find healthcare providers sorted by distance. You can also filter by specialty, city, and provider type."
          />
          <FaqItem
            question="Can I book an appointment without creating an account?"
            answer="Yes! MediFind allows you to book appointments without creating an account. Simply find your provider, select a time slot, and enter your basic contact details."
          />
          <FaqItem
            question="How much does it cost to use MediFind?"
            answer="MediFind is completely free for patients. There are no booking fees or hidden charges. You only pay the provider's consultation fee directly at the clinic."
          />
          <FaqItem
            question="Are the providers verified?"
            answer="Yes, providers with a 'Verified' badge have been reviewed by our team. We check their medical registration, qualifications, and practice details before approval."
          />
          <FaqItem
            question="How can I list my practice on MediFind?"
            answer="If you're a doctor, pharmacy, or diagnostic lab, click 'List Your Practice' and complete the 2-step onboarding. You'll start on the Free plan — no credit card required."
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
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} shrink-0`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold truncate">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <Icon className="h-6 w-6 mb-2" aria-hidden="true" />
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-white/80 mt-1">{description}</div>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, description }: { step: string; icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-border/40 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="absolute -top-2 -right-2 text-7xl font-bold text-primary/5 select-none" aria-hidden="true">{step}</div>
        <div className="relative">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-medical-soft text-primary mb-4">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-sm md:text-base">{question}</span>
        <PlusCircle className={`h-4 w-4 text-primary shrink-0 transition-transform ${open ? 'rotate-45' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
          {answer}
        </div>
      )}
    </Card>
  )
}
