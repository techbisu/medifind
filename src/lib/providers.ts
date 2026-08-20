import { db } from './db'

export interface ProviderDTO {
  id: string
  type: 'DOCTOR' | 'MEDICAL_SHOP' | 'CLINIC_LAB'
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  area: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  status: string
  verified: boolean
  rating: number
  reviewCount: number
  viewCount: number
  subscriptionTier: string
  bookingEnabled: boolean
  /** Distance in km from the user's location, if a location query was used */
  distance?: number
  doctorProfile?: {
    specialty: string | null
    specialties: string[]
    qualifications: string | null
    experienceYears: number
    consultationFee: number
    languages: string[]
    healthIssues: string[]
    about: string | null
    gender: string | null
    registrationNo: string | null
  } | null
  _count?: {
    reviews: number
    appointments: number
    labTests: number
    shopServices: number
    shopChambers: number
  }
}

export function toProviderDTO(p: any): ProviderDTO {
  return {
    id: p.id,
    type: p.type,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? null,
    description: p.description ?? null,
    logoUrl: p.logoUrl ?? null,
    coverUrl: p.coverUrl ?? null,
    phone: p.phone ?? null,
    email: p.email ?? null,
    website: p.website ?? null,
    address: p.address ?? null,
    city: p.city ?? null,
    area: p.area ?? null,
    pincode: p.pincode ?? null,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    status: p.status,
    verified: p.verified,
    rating: p.rating,
    reviewCount: p.reviewCount,
    viewCount: p.viewCount,
    subscriptionTier: p.subscriptionTier,
    bookingEnabled: p.bookingEnabled ?? true,
    doctorProfile: p.doctorProfile
      ? {
          specialty: p.doctorProfile.specialty,
          specialties: safeParse(p.doctorProfile.specialtiesJson, []),
          qualifications: p.doctorProfile.qualifications,
          experienceYears: p.doctorProfile.experienceYears,
          consultationFee: p.doctorProfile.consultationFee,
          languages: safeParse(p.doctorProfile.languagesJson, []),
          healthIssues: safeParse(p.doctorProfile.healthIssuesJson, []),
          about: p.doctorProfile.about,
          gender: p.doctorProfile.gender,
          registrationNo: p.doctorProfile.registrationNo,
        }
      : null,
    _count: p._count
      ? {
          reviews: p._count.reviews ?? 0,
          appointments: p._count.appointments ?? 0,
          labTests: p._count.labTests ?? 0,
          shopServices: p._count.shopServices ?? 0,
          shopChambers: p._count.shopChambers ?? 0,
        }
      : undefined,
  }
}

export function safeParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

export const PROVIDER_INCLUDE = {
  doctorProfile: true,
  _count: {
    select: {
      reviews: true,
      appointments: true,
      labTests: true,
      shopServices: true,
      shopChambers: true,
    },
  },
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let i = 1
  while (await db.provider.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

export const PROVIDER_TYPE_LABELS: Record<string, string> = {
  DOCTOR: 'Doctor',
  MEDICAL_SHOP: 'Medical Shop',
  CLINIC_LAB: 'Clinic & Lab',
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
