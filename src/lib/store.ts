'use client'

import { create } from 'zustand'
import type { ProviderDTO } from '@/lib/providers'

// ============================================================
// TYPES
// ============================================================

export type ViewName =
  | 'home'
  | 'search'
  | 'provider-detail'
  | 'book-appointment'
  | 'login'
  | 'register'
  | 'provider-dashboard'
  | 'provider-onboarding'
  | 'admin-dashboard'
  | 'plans'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'PUBLIC' | 'PROVIDER' | 'ADMIN'
  phone?: string | null
}

export interface UserLocation {
  lat: number
  lng: number
  label?: string // human-readable, e.g. "Current location" or "Noida, IN"
}

const LOCATION_STORAGE_KEY = 'medifind_user_location'

/** Load saved location from localStorage (client-side only). */
function loadSavedLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed as UserLocation
    }
    return null
  } catch {
    return null
  }
}

interface AppState {
  // Navigation
  view: ViewName
  selectedProviderSlug: string | null
  selectedProvider: ProviderDTO | null
  searchQuery: string
  searchType: string // '' | DOCTOR | MEDICAL_SHOP | CLINIC_LAB
  searchCity: string
  searchSpecialty: string
  // Nearby search
  userLocation: UserLocation | null
  sortBy: 'default' | 'distance'
  searchRadius: number | null // km, null = no filter
  // Auth
  user: SessionUser | null
  authLoading: boolean
  // UI
  mobileMenuOpen: boolean

  // Actions
  setView: (v: ViewName) => void
  openProvider: (slug: string, provider?: ProviderDTO) => void
  setSearch: (q: string, type?: string, city?: string, specialty?: string) => void
  runSearch: () => void
  setUserLocation: (loc: UserLocation | null) => void
  setSortBy: (s: 'default' | 'distance') => void
  setSearchRadius: (r: number | null) => void
  setUser: (u: SessionUser | null) => void
  fetchSession: () => Promise<void>
  logout: () => Promise<void>
  setMobileMenuOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  selectedProviderSlug: null,
  selectedProvider: null,
  searchQuery: '',
  searchType: '',
  searchCity: '',
  searchSpecialty: '',
  userLocation: loadSavedLocation(),
  sortBy: 'default',
  searchRadius: null,
  user: null,
  authLoading: true,
  mobileMenuOpen: false,

  setView: (v) => {
    set({ view: v, mobileMenuOpen: false })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  openProvider: (slug, provider) => {
    set({
      selectedProviderSlug: slug,
      selectedProvider: provider || null,
      view: 'provider-detail',
      mobileMenuOpen: false,
    })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  setSearch: (q, type, city, specialty) => {
    set({
      ...(q !== undefined && { searchQuery: q }),
      ...(type !== undefined && { searchType: type }),
      ...(city !== undefined && { searchCity: city }),
      ...(specialty !== undefined && { searchSpecialty: specialty }),
    })
  },

  runSearch: () => {
    set({ view: 'search', mobileMenuOpen: false })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  setUser: (u) => set({ user: u, authLoading: false }),

  setUserLocation: (loc) => {
    set({ userLocation: loc })
    if (typeof window !== 'undefined') {
      try {
        if (loc) {
          window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc))
        } else {
          window.localStorage.removeItem(LOCATION_STORAGE_KEY)
        }
      } catch {}
    }
  },

  setSortBy: (s) => set({ sortBy: s }),

  setSearchRadius: (r) => set({ searchRadius: r }),

  fetchSession: async () => {
    try {
      const res = await fetch('/api/auth')
      const data = await res.json()
      set({ user: data.user, authLoading: false })
    } catch {
      set({ user: null, authLoading: false })
    }
  },

  logout: async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    set({ user: null, view: 'home' })
  },

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
