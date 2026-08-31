'use client'

import { useAppStore } from '@/lib/store'
import { Home, Search, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const { view, setView, user, setSearch, runSearch } = useAppStore()

  const navItems = user
    ? [
        { icon: Home, label: 'Home', view: 'home' as const, onClick: () => setView('home') },
        { icon: Search, label: 'Search', view: 'search' as const, onClick: () => { setSearch('', ''); runSearch() } },
        { icon: Calendar, label: 'Dashboard', view: user.role === 'ADMIN' ? 'admin-dashboard' as const : 'provider-dashboard' as const, onClick: () => setView(user.role === 'ADMIN' ? 'admin-dashboard' : user.role === 'PROVIDER' ? 'provider-dashboard' : 'home') },
        { icon: User, label: 'Account', view: 'home' as const, onClick: () => setView('home') },
      ]
    : [
        { icon: Home, label: 'Home', view: 'home' as const, onClick: () => setView('home') },
        { icon: Search, label: 'Search', view: 'search' as const, onClick: () => { setSearch('', ''); runSearch() } },
        { icon: Calendar, label: 'Book', view: 'search' as const, onClick: () => { setSearch('', 'DOCTOR'); runSearch() } },
        { icon: User, label: 'Sign In', view: 'login' as const, onClick: () => setView('login') },
      ]

  // Hide bottom nav on dashboard/admin views (they have their own navigation)
  if (view === 'provider-dashboard' || view === 'admin-dashboard' || view === 'book-appointment') {
    return null
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = view === item.view && idx > 0
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg transition-colors min-h-[44px]',
                isActive
                  ? 'text-primary bg-medical-soft/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
