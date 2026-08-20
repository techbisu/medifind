'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, MapPin, Phone, Clock, CheckCircle2, Stethoscope, Building2, Beaker, Navigation } from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { useAppStore } from '@/lib/store'
import { PROVIDER_TYPE_LABELS } from '@/lib/providers'

const TYPE_ICONS: Record<string, React.ElementType> = {
  DOCTOR: Stethoscope,
  MEDICAL_SHOP: Building2,
  CLINIC_LAB: Beaker,
}

/** Format distance in km or m for compact display. */
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function ProviderCard({ provider }: { provider: ProviderDTO }) {
  const { openProvider } = useAppStore()
  const Icon = TYPE_ICONS[provider.type] || Stethoscope

  const initials = provider.name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 animate-fade-in overflow-hidden"
      onClick={() => openProvider(provider.slug, provider)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarFallback className="bg-medical-soft text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition">
                  {provider.name}
                </h3>
                {provider.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{provider.tagline}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {typeof provider.distance === 'number' && (
                  <Badge variant="outline" className="bg-medical-soft text-primary border-primary/20 px-1.5 py-0">
                    <Navigation className="h-3 w-3 mr-0.5" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
                {provider.verified && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specialty tag for doctors */}
        {provider.type === 'DOCTOR' && provider.doctorProfile?.specialty && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-medical-soft text-primary font-medium">
              <Icon className="h-3 w-3 mr-1" />
              {provider.doctorProfile.specialty}
            </Badge>
            {provider.doctorProfile.experienceYears > 0 && (
              <span className="text-xs text-muted-foreground">
                {provider.doctorProfile.experienceYears}+ yrs exp
              </span>
            )}
          </div>
        )}

        {/* Type badge for non-doctors */}
        {provider.type !== 'DOCTOR' && (
          <div className="mt-3">
            <Badge variant="secondary" className="bg-medical-soft text-primary font-medium">
              <Icon className="h-3 w-3 mr-1" />
              {PROVIDER_TYPE_LABELS[provider.type]}
            </Badge>
          </div>
        )}

        {/* Location */}
        {(provider.area || provider.city) && (
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{[provider.area, provider.city].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Rating</span>
            <div className="flex items-center gap-0.5 font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {provider.rating.toFixed(1)}
              <span className="text-muted-foreground font-normal">({provider.reviewCount})</span>
            </div>
          </div>
          {provider.type === 'DOCTOR' && provider.doctorProfile?.consultationFee ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">₹{provider.doctorProfile.consultationFee}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Listings</span>
              <span className="font-medium">
                {provider._count?.labTests || provider._count?.shopServices || 0}+
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-muted-foreground">Tier</span>
            <Badge variant="outline" className="text-[10px] w-fit px-1 py-0">
              {provider.subscriptionTier}
            </Badge>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full mt-4 group-hover:bg-primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            openProvider(provider.slug, provider)
          }}
        >
          View {provider.type === 'DOCTOR' ? (provider.bookingEnabled === false ? 'Profile' : 'Profile & Book') : 'Details'}
        </Button>
        {provider.type === 'DOCTOR' && provider.bookingEnabled === false && (
          <p className="text-[10px] text-center text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
            <Phone className="h-2.5 w-2.5" /> Call to book
          </p>
        )}
      </CardContent>
    </Card>
  )
}

