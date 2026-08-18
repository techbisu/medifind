'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
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
  const { view, fetchSession, authLoading } = useAppStore()

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return (
    <>
      <Header />
      <main className="flex-1">
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
    </>
  )
}
