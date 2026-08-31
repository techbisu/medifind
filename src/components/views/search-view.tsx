'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProviderCard } from '@/components/provider-card'
import { SearchResultsSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import {
  Search, MapPin, SlidersHorizontal, X, Stethoscope, Building2, Beaker,
  Navigation, LocateFixed, Loader2, Ruler, ChevronDown, Star, Filter
} from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { toast } from 'sonner'

const TYPE_TABS = [
  { value: '', label: 'All', icon: Search },
  { value: 'DOCTOR', label: 'Doctors', icon: Stethoscope },
  { value: 'MEDICAL_SHOP', label: 'Pharmacies', icon: Building2 },
  { value: 'CLINIC_LAB', label: 'Labs', icon: Beaker },
]

const RADIUS_OPTIONS = [
  { value: '', label: 'Any distance' },
  { value: '2', label: 'Within 2 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
]

export function SearchView() {
  const {
    searchQuery, searchType, searchCity, searchSpecialty,
    userLocation, sortBy, searchRadius,
    setSearch, runSearch,
    setUserLocation, setSortBy, setSearchRadius,
  } = useAppStore()
  const [providers, setProviders] = useState<ProviderDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [locating, setLocating] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => {
        setSpecialties(d.specialties || [])
        setCities(d.cities || [])
      })
      .catch(() => {})
  }, [])

  const fetchProviders = () => {
    setLoading(true)
    setError(false)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchType) params.set('type', searchType)
    if (searchCity) params.set('city', searchCity)
    if (searchSpecialty) params.set('specialty', searchSpecialty)
    if (userLocation) {
      params.set('lat', userLocation.lat.toString())
      params.set('lng', userLocation.lng.toString())
      params.set('sortBy', sortBy)
      if (searchRadius) params.set('radius', searchRadius.toString())
    }
    params.set('limit', '24')

    fetch(`/api/providers?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProviders(d.providers || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  useEffect(() => { fetchProviders() }, [searchQuery, searchType, searchCity, searchSpecialty, userLocation, sortBy, searchRadius])

  const update = (field: 'q' | 'type' | 'city' | 'specialty', value: string) => {
    if (field === 'q') setSearch(value)
    else if (field === 'type') setSearch(undefined, value)
    else if (field === 'city') setSearch(undefined, undefined, value)
    else if (field === 'specialty') setSearch(undefined, undefined, undefined, value)
    runSearch()
  }

  const clearFilters = () => {
    setSearch('', '', '', '')
    setSearchRadius(null)
    setSortBy('default')
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
        toast.success('Location set — showing nearest providers first')
      },
      (err) => {
        setLocating(false)
        const msg = err.code === 1
          ? 'Location permission denied. You can still search by city.'
          : 'Could not get your location. Please try again.'
        toast.error(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  const clearLocation = () => {
    setUserLocation(null)
    setSearchRadius(null)
    setSortBy('default')
  }

  const hasFilters = !!(searchQuery || searchType || searchCity || searchSpecialty || userLocation)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Search' }]} className="mb-4" />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {searchType === 'DOCTOR' ? 'Find Doctors' :
           searchType === 'MEDICAL_SHOP' ? 'Medical Shops & Pharmacies' :
           searchType === 'CLINIC_LAB' ? 'Clinic & Diagnostic Labs' :
           'Search Healthcare Providers'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {loading ? 'Searching...' : `${total} ${total === 1 ? 'provider' : 'providers'} found`}
          {userLocation && !loading && (
            <span className="ml-1">· sorted by <span className="font-medium text-foreground">{sortBy === 'distance' ? 'nearest first' : 'relevance'}</span></span>
          )}
        </p>
      </div>

      {/* Search & Filters Card (Desktop) */}
      <Card className="mb-6 border-border/60 hidden md:block">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Text Search + Location */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={searchQuery}
                  onChange={(e) => update('q', e.target.value)}
                  placeholder="Search by name, specialty, condition, or location..."
                  className="pl-9 h-11"
                  aria-label="Search query"
                />
              </div>
              {userLocation ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="h-11 border-primary/40 bg-medical-soft/40" disabled>
                    <LocateFixed className="h-4 w-4 mr-1.5 text-primary" aria-hidden="true" />
                    <span className="text-xs">{userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-11" onClick={clearLocation} aria-label="Clear location">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="h-11 border-primary/40 hover:bg-medical-soft" onClick={useMyLocation} disabled={locating}>
                  {locating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Navigation className="h-4 w-4 mr-1.5 text-primary" />}
                  Use My Location
                </Button>
              )}
            </div>

            {/* Type Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = searchType === tab.value
                return (
                  <Button key={tab.value} variant={isActive ? 'default' : 'outline'} size="sm" className={isActive ? 'bg-medical-gradient' : ''} onClick={() => update('type', tab.value)}>
                    <Icon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={searchSpecialty} onValueChange={(v) => update('specialty', v === 'all' ? '' : v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All specialties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((s) => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>

              <Select value={searchCity} onValueChange={(v) => update('city', v === 'all' ? '' : v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((c) => (<SelectItem key={c} value={c as string}>{c}</SelectItem>))}
                </SelectContent>
              </Select>

              {userLocation ? (
                <Select value={searchRadius ? String(searchRadius) : 'all'} onValueChange={(v) => setSearchRadius(v === 'all' ? null : parseFloat(v))}>
                  <SelectTrigger className="h-10"><Ruler className="h-3.5 w-3.5 mr-1 text-muted-foreground" /><SelectValue placeholder="Any distance" /></SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map((r) => (<SelectItem key={r.value || 'all'} value={r.value || 'all'}>{r.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : null}

              {userLocation ? (
                <div className="flex gap-1 bg-muted p-1 rounded-md h-10 items-center">
                  <button onClick={() => setSortBy('default')} className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'default' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Top Rated</button>
                  <button onClick={() => setSortBy('distance')} className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'distance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Nearest</button>
                </div>
              ) : null}
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> Active:</span>
                {searchQuery && (<Badge variant="secondary" className="gap-1">&quot;{searchQuery}&quot;<button onClick={() => update('q', '')}><X className="h-3 w-3" /></button></Badge>)}
                {searchType && (<Badge variant="secondary" className="gap-1">{TYPE_TABS.find(t => t.value === searchType)?.label}<button onClick={() => update('type', '')}><X className="h-3 w-3" /></button></Badge>)}
                {searchSpecialty && (<Badge variant="secondary" className="gap-1">{searchSpecialty}<button onClick={() => update('specialty', '')}><X className="h-3 w-3" /></button></Badge>)}
                {searchCity && (<Badge variant="secondary" className="gap-1"><MapPin className="h-3 w-3" /> {searchCity}<button onClick={() => update('city', '')}><X className="h-3 w-3" /></button></Badge>)}
                {userLocation && (<Badge variant="secondary" className="gap-1 bg-medical-soft text-primary"><LocateFixed className="h-3 w-3" /> My Location{searchRadius && <span className="ml-1">· {searchRadius}km</span>}<button onClick={clearLocation}><X className="h-3 w-3" /></button></Badge>)}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">Clear all</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Search Bar (Sticky) */}
      <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input value={searchQuery} onChange={(e) => update('q', e.target.value)} placeholder="Search..." className="pl-9 h-10" aria-label="Search query" />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setShowMobileFilters(!showMobileFilters)} aria-label="Toggle filters">
            <Filter className="h-4 w-4" />
            {hasFilters && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {/* Mobile Type Tabs */}
        <div className="flex gap-1 mt-2 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = searchType === tab.value
            return (
              <Button key={tab.value} variant={isActive ? 'default' : 'outline'} size="sm" className={`h-8 shrink-0 ${isActive ? 'bg-medical-gradient' : ''}`} onClick={() => update('type', tab.value)}>
                <Icon className="h-3 w-3 mr-1" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="mt-3 p-3 border rounded-lg bg-card space-y-3 animate-fade-in">
            <Select value={searchSpecialty} onValueChange={(v) => update('specialty', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="All specialties" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialties</SelectItem>
                {specialties.map((s) => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={searchCity} onValueChange={(v) => update('city', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="All cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (<SelectItem key={c} value={c as string}>{c}</SelectItem>))}
              </SelectContent>
            </Select>

            {userLocation ? (
              <>
                <Select value={searchRadius ? String(searchRadius) : 'all'} onValueChange={(v) => setSearchRadius(v === 'all' ? null : parseFloat(v))}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Any distance" /></SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map((r) => (<SelectItem key={r.value || 'all'} value={r.value || 'all'}>{r.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1 bg-muted p-1 rounded-md h-10 items-center">
                  <button onClick={() => setSortBy('default')} className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'default' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Top Rated</button>
                  <button onClick={() => setSortBy('distance')} className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'distance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Nearest</button>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={clearLocation}><X className="h-3.5 w-3.5 mr-1" /> Clear Location</Button>
              </>
            ) : (
              <Button variant="outline" className="w-full h-10 border-primary/40" onClick={useMyLocation} disabled={locating}>
                {locating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Navigation className="h-4 w-4 mr-1.5 text-primary" />}
                Use My Location
              </Button>
            )}

            {hasFilters && (
              <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>Clear All Filters</Button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <SearchResultsSkeleton count={6} />
      ) : error ? (
        <EmptyState
          icon={Search}
          title="Couldn't load providers"
          description="We couldn't load healthcare providers right now. Please try again."
          action={{ label: 'Try Again', onClick: fetchProviders }}
        />
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No providers found"
          description={userLocation && searchRadius
            ? `No providers within ${searchRadius} km of your location. Try increasing the radius.`
            : 'Try adjusting your search filters'}
          action={hasFilters ? { label: 'Clear All Filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (<ProviderCard key={p.id} provider={p} />))}
        </div>
      )}
    </div>
  )
}
