'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProviderCard } from '@/components/provider-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search, MapPin, SlidersHorizontal, X, Stethoscope, Building2, Beaker,
  Navigation, LocateFixed, Loader2, Ruler
} from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { toast } from 'sonner'

const TYPE_TABS = [
  { value: '', label: 'All', icon: Search },
  { value: 'DOCTOR', label: 'Doctors', icon: Stethoscope },
  { value: 'MEDICAL_SHOP', label: 'Pharmacies', icon: Building2 },
  { value: 'CLINIC_LAB', label: 'Clinic & Labs', icon: Beaker },
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
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => {
        setSpecialties(d.specialties || [])
        setCities(d.cities || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
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
      .catch(() => setLoading(false))
  }, [searchQuery, searchType, searchCity, searchSpecialty, userLocation, sortBy, searchRadius])

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
          ? 'Location permission denied. Please allow location access.'
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
    <div className="container mx-auto max-w-7xl px-4 py-8 animate-fade-in">
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
            <span className="ml-1">· sorted by <span className="font-medium text-foreground">{sortBy === 'distance' ? 'nearest first' : 'relevance (closeness tiebreaker)'}</span></span>
          )}
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Text Search + Location */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => update('q', e.target.value)}
                  placeholder="Search by name, specialty, condition, or location..."
                  className="pl-9 h-11"
                />
              </div>
              {userLocation ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="default" className="h-11 border-primary/40 bg-medical-soft/40" disabled>
                    <LocateFixed className="h-4 w-4 mr-1.5 text-primary" />
                    <span className="text-xs">
                      {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}
                    </span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-11" onClick={clearLocation} title="Clear location">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-11 border-primary/40 hover:bg-medical-soft"
                  onClick={useMyLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Locating...</>
                  ) : (
                    <><Navigation className="h-4 w-4 mr-1.5 text-primary" /> Use My Location</>
                  )}
                </Button>
              )}
            </div>

            {/* Type Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = searchType === tab.value
                return (
                  <Button
                    key={tab.value}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className={isActive ? 'bg-medical-gradient' : ''}
                    onClick={() => update('type', tab.value)}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={searchSpecialty} onValueChange={(v) => update('specialty', v === 'all' ? '' : v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={searchCity} onValueChange={(v) => update('city', v === 'all' ? '' : v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c as string}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Radius (only when location is set) */}
              {userLocation ? (
                <Select
                  value={searchRadius ? String(searchRadius) : 'all'}
                  onValueChange={(v) => setSearchRadius(v === 'all' ? null : parseFloat(v))}
                >
                  <SelectTrigger className="h-10">
                    <Ruler className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map((r) => (
                      <SelectItem key={r.value || 'all'} value={r.value || 'all'}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              {/* Sort toggle (only when location is set) */}
              {userLocation ? (
                <div className="flex gap-1 bg-muted p-1 rounded-md h-10 items-center">
                  <button
                    onClick={() => setSortBy('default')}
                    className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'default' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    Top Rated
                  </button>
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`flex-1 h-8 px-2 text-xs font-medium rounded transition ${sortBy === 'distance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    Nearest
                  </button>
                </div>
              ) : null}
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" /> Active:
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => update('q', '')}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {searchType && (
                  <Badge variant="secondary" className="gap-1">
                    {TYPE_TABS.find(t => t.value === searchType)?.label}
                    <button onClick={() => update('type', '')}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {searchSpecialty && (
                  <Badge variant="secondary" className="gap-1">
                    {searchSpecialty}
                    <button onClick={() => update('specialty', '')}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {searchCity && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" /> {searchCity}
                    <button onClick={() => update('city', '')}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {userLocation && (
                  <Badge variant="secondary" className="gap-1 bg-medical-soft text-primary">
                    <LocateFixed className="h-3 w-3" /> My Location
                    {searchRadius && <span className="ml-1">· {searchRadius}km</span>}
                    <button onClick={clearLocation}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                  Clear all
                </Button>
              </div>
            )}

            {/* Location hint */}
            {!userLocation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Navigation className="h-3 w-3" />
                Tip: Click <span className="font-medium text-foreground">Use My Location</span> to find providers near you (sorted by distance, no API key required).
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mt-4" />
                <Skeleton className="h-9 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No providers found</h3>
            <p className="text-muted-foreground mt-1">
              {userLocation && searchRadius
                ? `No providers within ${searchRadius} km of your location. Try increasing the radius.`
                : 'Try adjusting your search filters'}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  )
}
