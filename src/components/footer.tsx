'use client'

import { useAppStore } from '@/lib/store'
import { PlusCircle, Stethoscope, Building2, Beaker, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { setView, setSearch, runSearch } = useAppStore()

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-medical-gradient">
                <PlusCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">
                  Medi<span className="text-medical-gradient">Find</span>
                </div>
                <div className="text-[10px] -mt-1 text-muted-foreground font-medium">Health Network</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              India&apos;s comprehensive medical marketplace connecting patients with verified doctors, pharmacies, and diagnostic labs. Book appointments, order medicines, and get lab tests done — all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Find Care</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => { setSearch('', 'DOCTOR'); runSearch(); }} className="hover:text-foreground transition flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" /> Doctors
                </button>
              </li>
              <li>
                <button onClick={() => { setSearch('', 'MEDICAL_SHOP'); runSearch(); }} className="hover:text-foreground transition flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Medical Shops
                </button>
              </li>
              <li>
                <button onClick={() => { setSearch('', 'CLINIC_LAB'); runSearch(); }} className="hover:text-foreground transition flex items-center gap-1.5">
                  <Beaker className="h-3.5 w-3.5" /> Diagnostic Labs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">For Providers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView('plans')} className="hover:text-foreground transition">Pricing</button></li>
              <li><button onClick={() => setView('provider-onboarding')} className="hover:text-foreground transition">List Your Practice</button></li>
              <li><button onClick={() => setView('login')} className="hover:text-foreground transition">Provider Login</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> care@medifind.com</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +91 99999 99999</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Noida, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MediFind Health Network. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition">Privacy Policy</button>
            <button className="hover:text-foreground transition">Terms of Service</button>
            <button className="hover:text-foreground transition">HIPAA Notice</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
