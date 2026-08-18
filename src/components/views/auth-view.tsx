'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mail, Lock, User, Phone, PlusCircle, Stethoscope, Building2, Beaker, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function AuthView() {
  const { setView, fetchSession, setUser } = useAppStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'PUBLIC' | 'PROVIDER'>('PUBLIC')
  const [providerType, setProviderType] = useState<'DOCTOR' | 'MEDICAL_SHOP' | 'CLINIC_LAB'>('DOCTOR')
  const [loading, setLoading] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setUser(data.user)
        toast.success(`Welcome back, ${data.user.name}!`)
        if (data.user.role === 'ADMIN') setView('admin-dashboard')
        else if (data.user.role === 'PROVIDER') setView('provider-dashboard')
        else setView('home')
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      toast.error('Please fill in all required fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, name, phone,
          role: role === 'PROVIDER' ? 'PROVIDER' : 'PUBLIC',
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setUser(data.user)
        toast.success('Account created successfully!')
        if (role === 'PROVIDER') {
          setView('provider-onboarding')
        } else {
          setView('home')
        }
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setMode('login')
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Marketing/info panel */}
        <div className="hidden lg:block">
          <div className="bg-medical-gradient text-white rounded-2xl p-8 medical-pattern">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-4">Welcome to MediFind</Badge>
            <h2 className="text-3xl font-bold mb-3">
              {mode === 'login' ? 'Welcome back to your health network' : 'Join India\'s largest health network'}
            </h2>
            <p className="text-white/90 mb-6">
              {mode === 'login'
                ? 'Sign in to manage your appointments, listings, or admin tasks.'
                : 'Create a free account to book appointments and manage your healthcare.'}
            </p>

            <div className="space-y-3">
              {[
                { icon: Stethoscope, label: 'Patients', desc: 'Book appointments with verified doctors' },
                { icon: Building2, label: 'Providers', desc: 'List your practice and reach thousands' },
                { icon: Beaker, label: 'Labs & Pharmacies', desc: 'Showcase tests, services, and chambers' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="bg-white/20 p-2 rounded-md">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-white/80">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo accounts */}
          <Card className="mt-4 border-dashed">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Demo Accounts</div>
              <div className="space-y-1.5 text-xs">
                <button onClick={() => fillDemo('admin@medifind.com', 'admin123')} className="w-full text-left p-2 rounded hover:bg-muted/50 flex justify-between">
                  <span>Admin</span>
                  <span className="text-muted-foreground">admin@medifind.com / admin123</span>
                </button>
                <button onClick={() => fillDemo('doctor@medifind.com', 'doctor123')} className="w-full text-left p-2 rounded hover:bg-muted/50 flex justify-between">
                  <span>Doctor</span>
                  <span className="text-muted-foreground">doctor@medifind.com / doctor123</span>
                </button>
                <button onClick={() => fillDemo('shop@medifind.com', 'shop123')} className="w-full text-left p-2 rounded hover:bg-muted/50 flex justify-between">
                  <span>Pharmacy</span>
                  <span className="text-muted-foreground">shop@medifind.com / shop123</span>
                </button>
                <button onClick={() => fillDemo('lab@medifind.com', 'lab123')} className="w-full text-left p-2 rounded hover:bg-muted/50 flex justify-between">
                  <span>Lab</span>
                  <span className="text-muted-foreground">lab@medifind.com / lab123</span>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Click any account to autofill credentials</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Auth form */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
              <button onClick={() => setMode('login')} className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                Sign In
              </button>
              <button onClick={() => setMode('register')} className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                Register
              </button>
            </div>

              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-medical-gradient" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Role selector */}
                  <div>
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setRole('PUBLIC')}
                        className={`p-3 border rounded-lg text-left transition ${role === 'PUBLIC' ? 'border-primary bg-medical-soft' : 'hover:bg-muted/50'}`}
                      >
                        <User className="h-4 w-4 mb-1 text-primary" />
                        <div className="text-sm font-medium">Patient</div>
                        <div className="text-[10px] text-muted-foreground">Book appointments</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('PROVIDER')}
                        className={`p-3 border rounded-lg text-left transition ${role === 'PROVIDER' ? 'border-primary bg-medical-soft' : 'hover:bg-muted/50'}`}
                      >
                        <PlusCircle className="h-4 w-4 mb-1 text-primary" />
                        <div className="text-sm font-medium">Provider</div>
                        <div className="text-[10px] text-muted-foreground">List my practice</div>
                      </button>
                    </div>
                  </div>

                  {role === 'PROVIDER' && (
                    <div>
                      <Label>Provider Type</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1.5">
                        {[
                          { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
                          { value: 'MEDICAL_SHOP', label: 'Pharmacy', icon: Building2 },
                          { value: 'CLINIC_LAB', label: 'Lab', icon: Beaker },
                        ].map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setProviderType(t.value as any)}
                            className={`p-2 border rounded-lg flex flex-col items-center text-xs transition ${providerType === t.value ? 'border-primary bg-medical-soft' : 'hover:bg-muted/50'}`}
                          >
                            <t.icon className="h-4 w-4 mb-1 text-primary" />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reg-name">Full Name / Practice Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Dr. John Doe / Wellness Pharmacy" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="reg-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reg-phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+91 9876543210" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="Min 6 characters" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-medical-gradient" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create {role === 'PROVIDER' ? 'Provider' : 'Patient'} Account
                  </Button>
                  {role === 'PROVIDER' && (
                    <p className="text-xs text-center text-muted-foreground">
                      You&apos;ll start on the <span className="font-medium text-foreground">Free plan</span> — no credit card required.
                    </p>
                  )}
                </form>
              )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <button onClick={() => setView('home')} className="hover:text-foreground inline-flex items-center gap-1">
                <ArrowRight className="h-3 w-3 rotate-180" /> Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
