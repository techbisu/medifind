'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Stethoscope,
  Search,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  PlusCircle,
  Building2,
  Beaker,
  CreditCard,
  Heart,
  Activity,
} from 'lucide-react'

export function Header() {
  const { user, view, setView, logout, mobileMenuOpen, setMobileMenuOpen, runSearch, searchQuery, setSearch } = useAppStore()
  const [q, setQ] = useState(searchQuery)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { setQ(searchQuery) }, [searchQuery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(q)
    runSearch()
  }

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'U'

  const navLinks = [
    { label: 'Doctors', icon: Stethoscope, onClick: () => { setSearch('', 'DOCTOR'); runSearch() } },
    { label: 'Pharmacies', icon: Building2, onClick: () => { setSearch('', 'MEDICAL_SHOP'); runSearch() } },
    { label: 'Labs', icon: Beaker, onClick: () => { setSearch('', 'CLINIC_LAB'); runSearch() } },
    { label: 'Pricing', icon: CreditCard, onClick: () => setView('plans') },
  ]

  return (
    <>
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-border"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md border-border/60 shadow-sm'
            : 'bg-background/80 backdrop-blur-sm border-border/40'
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 shrink-0 group"
              aria-label="MediFind home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-gradient shadow-sm group-hover:shadow-md transition-shadow">
                <PlusCircle className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold tracking-tight text-foreground">
                  Medi<span className="text-medical-gradient">Find</span>
                </div>
                <div className="text-[10px] -mt-1 text-muted-foreground font-medium">Health Network</div>
              </div>
            </button>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center gap-2" role="search">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search doctors, specialties, conditions..."
                  className="pl-9 pr-4 h-10 bg-muted/40 border-muted-foreground/20 focus-visible:bg-background transition-colors"
                  aria-label="Search healthcare providers"
                />
              </div>
            </form>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-auto" aria-label="Primary">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Button
                    key={link.label}
                    variant="ghost"
                    size="sm"
                    onClick={link.onClick}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  >
                    <Icon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {link.label}
                  </Button>
                )
              })}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2 ml-1">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-medical-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-xs font-normal text-muted-foreground truncate">{user.email}</span>
                        <Badge variant="outline" className="mt-0.5 w-fit text-[10px]">{user.role}</Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'PROVIDER' && (
                      <DropdownMenuItem onClick={() => setView('provider-dashboard')} className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <span>Provider Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => setView('admin-dashboard')} className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Admin Console</span>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'PUBLIC' && (
                      <DropdownMenuItem onClick={() => setView('provider-onboarding')} className="cursor-pointer">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        <span>List Your Practice</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Button variant="ghost" size="sm" onClick={() => setView('login')}>
                    <User className="h-4 w-4 mr-1.5" />
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => setView('provider-onboarding')} className="bg-medical-gradient shadow-sm">
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    List Practice
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-auto" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-medical-gradient">
                      <PlusCircle className="h-4 w-4 text-white" />
                    </div>
                    <span>Medi<span className="text-medical-gradient">Find</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-4 space-y-4 mt-4">
                  <form onSubmit={handleSearch} className="space-y-2" role="search">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search healthcare..."
                        className="pl-9"
                        aria-label="Search healthcare providers"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-medical-gradient">Search</Button>
                  </form>

                  <div className="grid gap-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Button
                          key={link.label}
                          variant="ghost"
                          size="sm"
                          className="justify-start h-11"
                          onClick={link.onClick}
                        >
                          <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                          {link.label}
                        </Button>
                      )
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <>
                        <div className="px-3 py-3 rounded-lg bg-muted">
                          <div className="text-sm font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          <Badge variant="outline" className="mt-1 text-[10px]">{user.role}</Badge>
                        </div>
                        {user.role === 'PROVIDER' && (
                          <Button variant="outline" size="sm" className="w-full h-10" onClick={() => setView('provider-dashboard')}>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Provider Dashboard
                          </Button>
                        )}
                        {user.role === 'ADMIN' && (
                          <Button variant="outline" size="sm" className="w-full h-10" onClick={() => setView('admin-dashboard')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Console
                          </Button>
                        )}
                        {user.role === 'PUBLIC' && (
                          <Button variant="outline" size="sm" className="w-full h-10" onClick={() => setView('provider-onboarding')}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            List Your Practice
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" className="w-full h-10" onClick={() => logout()}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="w-full h-10" onClick={() => setView('login')}>
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                        <Button size="sm" className="w-full h-10 bg-medical-gradient" onClick={() => setView('provider-onboarding')}>
                          <Heart className="h-4 w-4 mr-2" />
                          List Your Practice
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
