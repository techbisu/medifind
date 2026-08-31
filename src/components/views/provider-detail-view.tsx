'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { ProviderProfileSkeleton } from '@/components/ui/skeletons'
import { ErrorState } from '@/components/ui/error-state'
import {
  Star, MapPin, Phone, Mail, Globe, Clock, CheckCircle2, Calendar,
  Stethoscope, Building2, Beaker, ArrowLeft, Shield, Languages, GraduationCap,
  Award, Pill, Microscope, Heart, User, Navigation, ChevronRight
} from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { PROVIDER_TYPE_LABELS, DAYS_OF_WEEK } from '@/lib/providers'
import { providerJsonLd, generateProviderFaqs, faqJsonLd } from '@/lib/seo'

interface ProviderDetail extends ProviderDTO {
  chambers?: any[]
  shopChambers?: any[]
  shopServices?: any[]
  labTests?: any[]
  reviews?: any[]
}

export function ProviderDetailView() {
  const { selectedProviderSlug, selectedProvider, openProvider, setView } = useAppStore()
  const [provider, setProvider] = useState<ProviderDetail | null>(selectedProvider || null)
  const [loading, setLoading] = useState(!selectedProvider)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'services' | 'tests' | 'reviews'>('overview')

  useEffect(() => {
    if (!selectedProviderSlug) {
      setView('home')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`/api/providers/${selectedProviderSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.provider) {
          setProvider(d.provider)
          // Inject JSON-LD structured data for SEO
          const baseUrl = window.location.origin
          const jsonLd = providerJsonLd(d.provider, baseUrl)
          const faqs = generateProviderFaqs(d.provider)
          const existing = document.getElementById('provider-jsonld')
          if (existing) existing.remove()
          const script = document.createElement('script')
          script.type = 'application/ld+json'
          script.id = 'provider-jsonld'
          script.textContent = JSON.stringify(jsonLd)
          document.head.appendChild(script)

          if (faqs.length > 0) {
            const faqScript = document.createElement('script')
            faqScript.type = 'application/ld+json'
            faqScript.id = 'provider-faq-jsonld'
            faqScript.textContent = JSON.stringify(faqJsonLd(faqs))
            document.head.appendChild(faqScript)
          }

          // Update document title for SEO
          const specialty = d.provider.doctorProfile?.specialty
          const city = d.provider.city
          const newTitle = specialty
            ? `${d.provider.name} — ${specialty}${city ? ` in ${city}` : ''} | MediFind`
            : `${d.provider.name} | MediFind`
          document.title = newTitle

          // Update meta description
          const metaDesc = document.querySelector('meta[name="description"]')
          if (metaDesc) {
            metaDesc.setAttribute('content',
              `Book an appointment with ${d.provider.name}${specialty ? `, ${specialty}` : ''}${city ? ` in ${city}` : ''}. View qualifications, availability, consultation fee, reviews and chamber details on MediFind.`
            )
          }
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
      // Cleanup JSON-LD on unmount
      document.getElementById('provider-jsonld')?.remove()
      document.getElementById('provider-faq-jsonld')?.remove()
    }
  }, [selectedProviderSlug])

  if (loading) {
    return <ProviderProfileSkeleton />
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <ErrorState
          title="Provider not found"
          description="This provider may have been removed or is no longer available."
          onRetry={() => setView('search')}
        />
      </div>
    )
  }

  const Icon = provider.type === 'DOCTOR' ? Stethoscope :
               provider.type === 'MEDICAL_SHOP' ? Building2 : Beaker

  const initials = provider.name.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()

  const handleBook = () => {
    setView('book-appointment')
  }

  // Build breadcrumb items
  const breadcrumbItems: { label: string; onClick?: () => void }[] = []
  if (provider.type === 'DOCTOR' && provider.doctorProfile?.specialty) {
    const spec = provider.doctorProfile.specialty
    breadcrumbItems.push({ label: 'Doctors', onClick: () => { useAppStore.getState().setSearch('', 'DOCTOR'); useAppStore.getState().runSearch() } })
    breadcrumbItems.push({ label: spec, onClick: () => { useAppStore.getState().setSearch(spec, 'DOCTOR'); useAppStore.getState().runSearch() } })
    if (provider.city) breadcrumbItems.push({ label: provider.city, onClick: () => { useAppStore.getState().setSearch('', 'DOCTOR', provider.city || undefined); useAppStore.getState().runSearch() } })
  } else if (provider.type === 'MEDICAL_SHOP') {
    breadcrumbItems.push({ label: 'Pharmacies', onClick: () => { useAppStore.getState().setSearch('', 'MEDICAL_SHOP'); useAppStore.getState().runSearch() } })
    if (provider.city) breadcrumbItems.push({ label: provider.city, onClick: () => { useAppStore.getState().setSearch('', 'MEDICAL_SHOP', provider.city || undefined); useAppStore.getState().runSearch() } })
  } else if (provider.type === 'CLINIC_LAB') {
    breadcrumbItems.push({ label: 'Labs', onClick: () => { useAppStore.getState().setSearch('', 'CLINIC_LAB'); useAppStore.getState().runSearch() } })
    if (provider.city) breadcrumbItems.push({ label: provider.city, onClick: () => { useAppStore.getState().setSearch('', 'CLINIC_LAB', provider.city || undefined); useAppStore.getState().runSearch() } })
  }
  breadcrumbItems.push({ label: provider.name })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs items={breadcrumbItems} />
        <Button variant="ghost" size="sm" onClick={() => history.length > 1 ? history.back() : setView('search')} className="hidden md:flex">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      {/* Header Card */}
      <Card className="overflow-hidden border-border/60 mb-6">
        <div className="h-32 bg-medical-gradient relative">
          <div className="absolute inset-0 medical-pattern opacity-30" />
        </div>
        <CardContent className="p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-medical-soft text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 md:pt-12">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{provider.name}</h1>
                    {provider.verified && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-medical-soft text-primary">
                      <Icon className="h-3 w-3 mr-1" /> {PROVIDER_TYPE_LABELS[provider.type]}
                    </Badge>
                  </div>
                  {provider.tagline && (
                    <p className="text-muted-foreground mt-1">{provider.tagline}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                      ({provider.reviewCount} reviews)
                    </span>
                    {provider.area && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {provider.area}{provider.city ? `, ${provider.city}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-48">
                  {provider.type === 'DOCTOR' && provider.bookingEnabled && (
                    <Button size="lg" className="bg-medical-gradient" onClick={handleBook}>
                      <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                    </Button>
                  )}
                  {provider.type === 'DOCTOR' && !provider.bookingEnabled && (
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center bg-amber-50 text-amber-700 border-amber-200 py-1.5">
                        <Clock className="h-3 w-3 mr-1" /> Online booking disabled
                      </Badge>
                      {provider.phone && (
                        <Button size="lg" variant="default" className="w-full bg-medical-gradient" asChild>
                          <a href={`tel:${provider.phone}`}>
                            <Phone className="h-4 w-4 mr-2" /> Call to Book
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                  {provider.type !== 'DOCTOR' && provider.phone && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={`tel:${provider.phone}`}>
                        <Phone className="h-4 w-4 mr-2" /> Call
                      </a>
                    </Button>
                  )}
                  {provider.type !== 'DOCTOR' && !provider.phone && (
                    <Badge variant="outline" className="w-full justify-center bg-muted text-muted-foreground py-1.5">
                      Visit in person
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'overview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Overview
          </button>
          {provider.type === 'DOCTOR' && (
            <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'schedule' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Schedule
            </button>
          )}
          {provider.type === 'MEDICAL_SHOP' && (
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'services' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Services
            </button>
          )}
          {provider.type === 'CLINIC_LAB' && (
            <button onClick={() => setActiveTab('tests')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'tests' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Lab Tests
            </button>
          )}
          <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'reviews' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Reviews ({provider.reviewCount})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
        <div className="space-y-4">
          {provider.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{provider.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Doctor-specific info */}
          {provider.type === 'DOCTOR' && provider.doctorProfile && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" /> Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {provider.doctorProfile.qualifications && (
                    <div>
                      <div className="text-muted-foreground">Education</div>
                      <div className="font-medium">{provider.doctorProfile.qualifications}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Experience</div>
                    <div className="font-medium">{provider.doctorProfile.experienceYears}+ years</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Consultation Fee</div>
                    <div className="font-medium">₹{provider.doctorProfile.consultationFee}</div>
                  </div>
                  {provider.doctorProfile.registrationNo && (
                    <div>
                      <div className="text-muted-foreground">Registration No.</div>
                      <div className="font-medium">{provider.doctorProfile.registrationNo}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" /> Specialties & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {provider.doctorProfile.specialty && (
                    <div>
                      <div className="text-muted-foreground">Primary Specialty</div>
                      <Badge variant="secondary" className="bg-medical-soft text-primary mt-1">
                        {provider.doctorProfile.specialty}
                      </Badge>
                    </div>
                  )}
                  {provider.doctorProfile.specialties.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">All Specialties</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.doctorProfile.specialties.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {provider.doctorProfile.languages.length > 0 && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Languages className="h-3 w-3" /> Languages
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.doctorProfile.languages.map((l) => (
                          <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {provider.doctorProfile.healthIssues.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Treats</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.doctorProfile.healthIssues.map((h) => (
                          <Badge key={h} variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">{h}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
              {provider.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-muted-foreground text-xs">Address</div>
                    <div>{provider.address}</div>
                    {provider.pincode && <div className="text-muted-foreground text-xs">PIN: {provider.pincode}</div>}
                  </div>
                </div>
              )}
              {provider.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-muted-foreground text-xs">Phone</div>
                    <a href={`tel:${provider.phone}`} className="hover:text-primary">{provider.phone}</a>
                  </div>
                </div>
              )}
              {provider.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-muted-foreground text-xs">Email</div>
                    <a href={`mailto:${provider.email}`} className="hover:text-primary">{provider.email}</a>
                  </div>
                </div>
              )}
              {provider.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-muted-foreground text-xs">Website</div>
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{provider.website}</a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Schedule Tab (Doctors) */}
        {activeTab === 'schedule' && provider.type === 'DOCTOR' && (
          <div className="space-y-4">
            {!provider.bookingEnabled && (
              <Card className="border-amber-500/40 bg-amber-50/50">
                <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>This provider has disabled online booking. Please call to schedule an appointment.</span>
                </CardContent>
              </Card>
            )}
            {provider.chambers && provider.chambers.length > 0 ? (
              provider.chambers.map((chamber: any) => <ChamberScheduleCard key={chamber.id} chamber={chamber} onBook={handleBook} />)
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No chamber schedule available.
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* Services Tab (Medical Shop) */}
        {activeTab === 'services' && provider.type === 'MEDICAL_SHOP' && (
          <div className="space-y-4">
            {/* Doctors with chambers here */}
            {provider.shopChambers && provider.shopChambers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" /> Doctors Consulting Here
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.shopChambers.map((chamber: any) => (
                    <div key={chamber.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                      onClick={() => openProvider(chamber.doctor.slug)}>
                      <div>
                        <div className="font-medium">{chamber.doctor.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {chamber.visitingHours || 'See schedule'}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Shop Services */}
            {provider.shopServices && provider.shopServices.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" /> Products & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {provider.shopServices.map((svc: any) => (
                      <div key={svc.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{svc.name}</div>
                            {svc.description && <div className="text-xs text-muted-foreground mt-0.5">{svc.description}</div>}
                            {svc.category && <Badge variant="outline" className="mt-1 text-[10px]">{svc.category}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No services listed.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lab Tests Tab */}
        {activeTab === 'tests' && provider.type === 'CLINIC_LAB' && (
          <div className="space-y-4">
            {provider.labTests && provider.labTests.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Microscope className="h-5 w-5 text-primary" /> Available Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {provider.labTests.map((test: any) => (
                      <div key={test.id} className="p-3 border rounded-lg hover:border-primary/40 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{test.name}</div>
                            {test.description && <div className="text-xs text-muted-foreground mt-0.5">{test.description}</div>}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {test.category && <Badge variant="outline" className="text-[10px]">{test.category}</Badge>}
                              {test.reportTime && <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{test.reportTime}</Badge>}
                              {test.fastingRequired && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">Fasting</Badge>}
                              {test.sampleType && <Badge variant="outline" className="text-[10px]">{test.sampleType}</Badge>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {test.discountPrice ? (
                              <>
                                <div className="text-xs text-muted-foreground line-through">₹{test.price}</div>
                                <div className="font-bold text-primary">₹{test.discountPrice}</div>
                              </>
                            ) : (
                              <div className="font-bold">₹{test.price}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No lab tests listed.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <ReviewsList providerId={provider.id} reviews={provider.reviews || []} rating={provider.rating} count={provider.reviewCount} />
          </div>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="grid grid-cols-2 gap-2 p-3">
          {provider.phone && (
            <Button variant="outline" size="lg" asChild>
              <a href={`tel:${provider.phone}`}>
                <Phone className="h-4 w-4 mr-2" /> Call
              </a>
            </Button>
          )}
          {provider.type === 'DOCTOR' && provider.bookingEnabled && (
            <Button size="lg" className="bg-medical-gradient" onClick={handleBook}>
              <Calendar className="h-4 w-4 mr-2" /> Book Now
            </Button>
          )}
          {provider.type === 'DOCTOR' && !provider.bookingEnabled && provider.phone && (
            <Button size="lg" className="bg-medical-gradient" asChild>
              <a href={`tel:${provider.phone}`}>
                <Phone className="h-4 w-4 mr-2" /> Call to Book
              </a>
            </Button>
          )}
          {provider.type !== 'DOCTOR' && !provider.phone && (
            <Button variant="outline" size="lg" disabled>
              Visit in person
            </Button>
          )}
        </div>
      </div>
      {/* Spacer for sticky CTA on mobile */}
      <div className="lg:hidden h-20" aria-hidden="true" />
    </div>
  )
}

function ChamberScheduleCard({ chamber, onBook }: { chamber: any; onBook: () => void }) {
  const schedules = chamber.schedules || []
  // Group by day
  const byDay: Record<number, any[]> = {}
  schedules.forEach((s: any) => {
    if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = []
    byDay[s.dayOfWeek].push(s)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> {chamber.name}
        </CardTitle>
        {chamber.shop && (
          <Badge variant="outline" className="bg-medical-soft text-primary w-fit">
            at {chamber.shop.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {chamber.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>{chamber.address}</div>
          </div>
        )}
        {chamber.visitingHours && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>{chamber.visitingHours}</div>
          </div>
        )}
        <Separator />
        <div>
          <div className="text-sm font-medium mb-2">Weekly Schedule</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day, idx) => {
              const daySchedules = byDay[idx]
              if (!daySchedules || daySchedules.length === 0) {
                return (
                  <div key={day} className="flex items-center justify-between p-2 text-xs border rounded">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="text-muted-foreground/60">Closed</span>
                  </div>
                )
              }
              return (
                <div key={day} className="flex items-center justify-between p-2 text-xs border rounded bg-medical-soft/30">
                  <span className="font-medium">{day}</span>
                  <span className="text-primary">
                    {daySchedules.map((s: any) => `${s.startTime}-${s.endTime}`).join(', ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <Button className="w-full bg-medical-gradient mt-2" onClick={onBook}>
          <Calendar className="h-4 w-4 mr-2" /> Book Appointment at this Chamber
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-1">
          You&apos;ll be asked to confirm date, time, and patient details on the next screen.
        </p>
      </CardContent>
    </Card>
  )
}

function ReviewsList({ providerId, reviews, rating, count }: { providerId: string; reviews: any[]; rating: number; count: number }) {
  const { user } = useAppStore()
  const [reviewList, setReviewList] = useState(reviews)
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          rating: newRating,
          comment: newComment,
          userName: user?.name,
        }),
      })
      const data = await res.json()
      if (data.review) {
        setReviewList([data.review, ...reviewList])
        setNewComment('')
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Patient Reviews</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Write Review'}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="text-3xl font-bold">{rating.toFixed(1)}</div>
          <div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{count} reviews</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <form onSubmit={submit} className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div>
              <div className="text-sm font-medium mb-1">Your Rating</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setNewRating(s)}>
                    <Star className={`h-6 w-6 ${s <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Your Review</div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-2 text-sm border rounded-md min-h-[80px]"
              />
            </div>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}

        {reviewList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviewList.map((r) => (
            <div key={r.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-medical-soft text-primary text-xs">
                      {r.userName.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      {r.userName}
                      {r.isVerified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
