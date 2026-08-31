'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, MapPin, Phone, CheckCircle2, Stethoscope, Building2, Beaker, Navigation, ArrowRight } from 'lucide-react'
import type { ProviderDTO } from '@/lib/providers'
import { useAppStore } from '@/lib/store'
import { PROVIDER_TYPE_LABELS } from '@/lib/providers'

const TYPE_ICONS: Record<string, React.ElementType> = {
  DOCTOR: Stethoscope,
  MEDICAL_SHOP: Building2,
  CLINIC_LAB: Beaker,
}

const TYPE_COLORS: Record<string, string> = {
  DOCTOR: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
  MEDICAL_SHOP: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  CLINIC_LAB: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
}

/** Format distance for compact display. */
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function ProviderCard({ provider }: { provider: ProviderDTO }) {
  const { openProvider } = useAppStore()
  const Icon = TYPE_ICONS[provider.type] || Stethoscope
  const typeColor = TYPE_COLORS[provider.type] || TYPE_COLORS.DOCTOR

  const initials = provider.name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  const bookingDisabled = provider.type === 'DOCTOR' && provider.bookingEnabled === false

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in overflow-hidden"
      onClick={() => openProvider(provider.slug, provider)}
      role="article"
      aria-label={`${provider.name} — ${PROVIDER_TYPE_LABELS[provider.type]}`}
    >
      <CardContent className="p-5">
        {/* Top: Avatar + Name + Badges */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm shrink-0">
            <AvatarFallback className="bg-medical-soft text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                  {provider.name}
                </h3>
                {provider.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{provider.tagline}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                {typeof provider.distance === 'number' && (
                  <Badge variant="outline" className="bg-medical-soft/50 text-primary border-primary/20 px-1.5 py-0 text-[10px]">
                    <Navigation className="h-2.5 w-2.5 mr-0.5" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
                {provider.verified && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-1.5 py-0 text-[10px]" title="Verified by MediFind">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specialty / Type */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`${typeColor} font-medium`}>
            <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
            {provider.type === 'DOCTOR' && provider.doctorProfile?.specialty
              ? provider.doctorProfile.specialty
              : PROVIDER_TYPE_LABELS[provider.type]}
          </Badge>
          {provider.type === 'DOCTOR' && provider.doctorProfile && provider.doctorProfile.experienceYears > 0 && (
            <span className="text-xs text-muted-foreground">
              {provider.doctorProfile.experienceYears}+ yrs exp
            </span>
          )}
        </div>

        {/* Location */}
        {(provider.area || provider.city) && (
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 shrink-0" aria-hidden="true" />
            <span className="truncate">{[provider.area, provider.city].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs border-t border-border/40 pt-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Rating</span>
            <div className="flex items-center gap-0.5 font-semibold text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              {provider.rating.toFixed(1)}
              <span className="text-muted-foreground font-normal text-[10px]">({provider.reviewCount})</span>
            </div>
          </div>
          {provider.type === 'DOCTOR' && provider.doctorProfile?.consultationFee ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Fee</span>
              <span className="font-semibold text-foreground">₹{provider.doctorProfile.consultationFee}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Listings</span>
              <span className="font-semibold text-foreground">
                {provider._count?.labTests || provider._count?.shopServices || 0}+
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Tier</span>
            <Badge variant="outline" className="text-[9px] w-fit px-1 py-0 font-medium">
              {provider.subscriptionTier}
            </Badge>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full mt-4 bg-medical-gradient group-hover:shadow-md transition-shadow"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            openProvider(provider.slug, provider)
          }}
        >
          {provider.type === 'DOCTOR' ? (bookingDisabled ? 'View Profile' : 'Book Appointment') : 'View Details'}
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        {bookingDisabled && (
          <p className="text-[10px] text-center text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
            <Phone className="h-2.5 w-2.5" aria-hidden="true" /> Call to book
          </p>
        )}
      </CardContent>
    </Card>
  )
}
