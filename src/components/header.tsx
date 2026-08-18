'use client'

import Link from 'next/link'
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
  Heart,
  PlusCircle,
  Building2,
  Beaker,
  CreditCard,
} from 'lucide-react'

export function Header() {
  const { user, view, setView, logout, mobileMenuOpen, setMobileMenuOpen, runSearch, searchQuery, setSearch } = useAppStore()
  const [q, setQ] = useState(searchQuery)

  useEffect(() => { setQ(searchQuery) }, [searchQuery])

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-medical-gradient shadow-sm">
              <PlusCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-foreground">
                Medi<span className="text-medical-gradient">Find</span>
              </div>
              <div className="text-[10px] -mt-1 text-muted-foreground font-medium">Health Network</div>
            </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctors, shops, labs, conditions..."
                className="pl-9 pr-4 h-10 bg-muted/40 border-muted-foreground/20"
              />
            </div>
            <Button type="submit" size="sm" className="h-10">Search</Button>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => { setView('home'); }}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSearch('', 'DOCTOR'); runSearch(); }}>
              <Stethoscope className="h-4 w-4 mr-1" /> Doctors
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSearch('', 'MEDICAL_SHOP'); runSearch(); }}>
              <Building2 className="h-4 w-4 mr-1" /> Pharmacy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSearch('', 'CLINIC_LAB'); runSearch(); }}>
              <Beaker className="h-4 w-4 mr-1" /> Labs
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('plans')}>
              <CreditCard className="h-4 w-4 mr-1" /> Pricing
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-medical-gradient text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden xl:inline text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      <Badge variant="outline" className="mt-1 w-fit text-[10px]">{user.role}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'PROVIDER' && (
                    <DropdownMenuItem onClick={() => setView('provider-dashboard')}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Provider Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => setView('admin-dashboard')}>
                      <Shield className="h-4 w-4 mr-2" /> Admin Console
                    </DropdownMenuItem>
                  )}
                  {user.role === 'PUBLIC' && (
                    <DropdownMenuItem onClick={() => setView('provider-onboarding')}>
                      <PlusCircle className="h-4 w-4 mr-2" /> List Your Practice
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setView('login')}>
                  <User className="h-4 w-4 mr-1" /> Sign In
                </Button>
                <Button size="sm" onClick={() => setView('provider-onboarding')} className="bg-medical-gradient">
                  <Heart className="h-4 w-4 mr-1" /> List Practice
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden ml-auto">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-medical-gradient">
                    <PlusCircle className="h-4 w-4 text-white" />
                  </div>
                  MediFind Menu
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4 space-y-3 mt-4">
                <form onSubmit={handleSearch} className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search..."
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full">Search</Button>
                </form>

                <div className="grid gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => setView('home')}>Home</Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setSearch('', 'DOCTOR'); runSearch(); }}>
                    <Stethoscope className="h-4 w-4 mr-2" /> Find Doctors
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setSearch('', 'MEDICAL_SHOP'); runSearch(); }}>
                    <Building2 className="h-4 w-4 mr-2" /> Medical Shops
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setSearch('', 'CLINIC_LAB'); runSearch(); }}>
                    <Beaker className="h-4 w-4 mr-2" /> Clinic & Labs
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => setView('plans')}>
                    <CreditCard className="h-4 w-4 mr-2" /> Pricing Plans
                  </Button>
                </div>

                <div className="border-t pt-3 space-y-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 rounded-lg bg-muted">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <Badge variant="outline" className="mt-1 text-[10px]">{user.role}</Badge>
                      </div>
                      {user.role === 'PROVIDER' && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setView('provider-dashboard')}>
                          <LayoutDashboard className="h-4 w-4 mr-2" /> Provider Dashboard
                        </Button>
                      )}
                      {user.role === 'ADMIN' && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setView('admin-dashboard')}>
                          <Shield className="h-4 w-4 mr-2" /> Admin Console
                        </Button>
                      )}
                      {user.role === 'PUBLIC' && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setView('provider-onboarding')}>
                          <PlusCircle className="h-4 w-4 mr-2" /> List Your Practice
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" className="w-full" onClick={() => logout()}>
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setView('login')}>
                        <User className="h-4 w-4 mr-2" /> Sign In
                      </Button>
                      <Button size="sm" className="w-full bg-medical-gradient" onClick={() => setView('provider-onboarding')}>
                        <Heart className="h-4 w-4 mr-2" /> List Your Practice
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
  )
}
