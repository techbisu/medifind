'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { HomeView } from '@/components/views/home-view'
import { SearchView } from '@/components/views/search-view'
import { ProviderDetailView } from '@/components/views/provider-detail-view'
import { BookAppointmentView } from '@/components/views/book-appointment-view'
import { AuthView } from '@/components/views/auth-view'
import { PlansView } from '@/components/views/plans-view'
import { ProviderOnboardingView } from '@/components/views/provider-onboarding-view'
import { ProviderDashboardView } from '@/components/views/provider-dashboard-view'
import { AdminDashboardView } from '@/components/views/admin-dashboard-view'

export default function Home() {
  const { view, fetchSession } = useAppStore()

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Show mobile bottom nav only on public-facing views
  const showBottomNav = ['home', 'search', 'provider-detail', 'plans', 'login', 'register'].includes(view)

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        {view === 'home' && <HomeView />}
        {view === 'search' && <SearchView />}
        {view === 'provider-detail' && <ProviderDetailView />}
        {view === 'book-appointment' && <BookAppointmentView />}
        {view === 'login' && <AuthView />}
        {view === 'register' && <AuthView />}
        {view === 'plans' && <PlansView />}
        {view === 'provider-onboarding' && <ProviderOnboardingView />}
        {view === 'provider-dashboard' && <ProviderDashboardView />}
        {view === 'admin-dashboard' && <AdminDashboardView />}
      </main>
      <Footer />
      {showBottomNav && <MobileBottomNav />}
    </>
  )
}
