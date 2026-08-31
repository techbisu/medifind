'use client'

import { useAppStore } from '@/lib/store'
import { PlusCircle, Stethoscope, Building2, Beaker, Heart, Mail, Phone, MapPin, Shield, FileText, HelpCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { setView, setSearch, runSearch } = useAppStore()
  const year = new Date().getFullYear()

  const linkClass = "text-sm text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer"

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-gradient shadow-sm">
                <PlusCircle className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">
                  Medi<span className="text-medical-gradient">Find</span>
                </div>
                <div className="text-[10px] -mt-1 text-muted-foreground font-medium">Health Network</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              India&apos;s comprehensive medical marketplace connecting patients with verified doctors, pharmacies, and diagnostic labs.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge2 icon={Shield} text="HIPAA Aware" />
              <Badge2 icon={Heart} text="Patient First" />
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">For Patients</h3>
            <ul className="space-y-2.5">
              <li><button className={linkClass} onClick={() => { setSearch('', 'DOCTOR'); runSearch() }}>
                <span className="flex items-center gap-1.5"><Stethoscope className="h-3 w-3" /> Find Doctors</span>
              </button></li>
              <li><button className={linkClass} onClick={() => { setSearch('', 'MEDICAL_SHOP'); runSearch() }}>
                <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Find Pharmacies</span>
              </button></li>
              <li><button className={linkClass} onClick={() => { setSearch('', 'CLINIC_LAB'); runSearch() }}>
                <span className="flex items-center gap-1.5"><Beaker className="h-3 w-3" /> Find Labs</span>
              </button></li>
              <li><button className={linkClass} onClick={() => { setSearch('', 'DOCTOR'); runSearch() }}>
                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Book Appointment</span>
              </button></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">For Providers</h3>
            <ul className="space-y-2.5">
              <li><button className={linkClass} onClick={() => setView('plans')}>Pricing Plans</button></li>
              <li><button className={linkClass} onClick={() => setView('provider-onboarding')}>List Your Practice</button></li>
              <li><button className={linkClass} onClick={() => setView('login')}>Provider Login</button></li>
              <li><button className={linkClass} onClick={() => setView('provider-onboarding')}>Join MediFind</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Company</h3>
            <ul className="space-y-2.5">
              <li><button className={linkClass}>About Us</button></li>
              <li><button className={linkClass}>Contact</button></li>
              <li><button className={linkClass}><span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Privacy Policy</span></button></li>
              <li><button className={linkClass}><span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Terms of Service</span></button></li>
              <li><button className={linkClass}><span className="flex items-center gap-1.5"><HelpCircle className="h-3 w-3" /> Help & FAQs</span></button></li>
            </ul>
          </div>
        </div>

        {/* Contact bar */}
        <div className="mt-8 pt-8 border-t border-border/60 grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>care@medifind.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>+91 99999 99999</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Noida, India</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} MediFind Health Network. Healthcare discovery made simple.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition">Privacy</button>
            <button className="hover:text-foreground transition">Terms</button>
            <button className="hover:text-foreground transition">HIPAA Notice</button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Badge2({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border/60 text-[10px] font-medium text-muted-foreground">
      <Icon className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
      {text}
    </span>
  )
}
