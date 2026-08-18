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

interface AppState {
  // Navigation
  view: ViewName
  selectedProviderSlug: string | null
  selectedProvider: ProviderDTO | null
  searchQuery: string
  searchType: string // '' | DOCTOR | MEDICAL_SHOP | CLINIC_LAB
  searchCity: string
  searchSpecialty: string
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
