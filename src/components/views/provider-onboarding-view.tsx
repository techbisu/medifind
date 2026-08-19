'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Stethoscope, Building2, Beaker, ArrowRight, CheckCircle2, Loader2,
  MapPin, Phone, Mail, Globe, User, Award, Languages, Heart
} from 'lucide-react'
import { toast } from 'sonner'

type ProviderType = 'DOCTOR' | 'MEDICAL_SHOP' | 'CLINIC_LAB'

const TYPE_OPTIONS: { value: ProviderType; label: string; description: string; icon: any }[] = [
  { value: 'DOCTOR', label: 'Doctor', description: 'List your practice, manage chambers & appointments', icon: Stethoscope },
  { value: 'MEDICAL_SHOP', label: 'Medical Shop', description: 'Pharmacy with medicines, products & doctor chambers', icon: Building2 },
  { value: 'CLINIC_LAB', label: 'Clinic & Lab', description: 'Diagnostic center with lab tests and health packages', icon: Beaker },
]

export function ProviderOnboardingView() {
  const { user, setView, fetchSession } = useAppStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [type, setType] = useState<ProviderType>('DOCTOR')
  const [loading, setLoading] = useState(false)

  // Common fields
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [pincode, setPincode] = useState('')

  // Doctor-specific
  const [specialty, setSpecialty] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [consultationFee, setConsultationFee] = useState('')
  const [languages, setLanguages] = useState('')
  const [healthIssues, setHealthIssues] = useState('')
  const [about, setAbout] = useState('')
  const [gender, setGender] = useState('')
  const [registrationNo, setRegistrationNo] = useState('')

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <Card>
          <CardContent className="py-12">
            <h2 className="text-xl font-bold mb-2">Sign in to list your practice</h2>
            <p className="text-muted-foreground mb-6">You need an account to create a provider listing.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setView('login')} className="bg-medical-gradient">Sign In</Button>
              <Button variant="outline" onClick={() => setView('home')}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !type) {
      toast.error('Please fill in the practice name')
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        type,
        name,
        tagline,
        description,
        phone,
        email,
        website,
        address,
        city,
        area,
        pincode,
      }

      if (type === 'DOCTOR') {
        payload.specialty = specialty
        payload.specialties = specialty ? [specialty] : []
        payload.qualifications = qualifications
        payload.experienceYears = experienceYears
        payload.consultationFee = consultationFee
        payload.languages = languages.split(',').map((s) => s.trim()).filter(Boolean)
        payload.healthIssues = healthIssues.split(',').map((s) => s.trim()).filter(Boolean)
        payload.about = about
        payload.gender = gender
        payload.registrationNo = registrationNo
      }

      const res = await fetch('/api/dashboard/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Provider listing created! Auto-enrolled in Free plan.')
        await fetchSession()
        setView('provider-dashboard')
      }
    } catch {
      toast.error('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-3 bg-medical-soft text-primary border-primary/30">
          Free Plan — No Credit Card Required
        </Badge>
        <h1 className="text-3xl font-bold">List Your Practice on MediFind</h1>
        <p className="text-muted-foreground mt-2">
          Join thousands of healthcare providers reaching patients online.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-medical-gradient text-white' : 'bg-muted'}`}>1</div>
          <span className="text-sm font-medium hidden sm:inline">Choose Type</span>
        </div>
        <div className="h-1 w-12 bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-medical-gradient text-white' : 'bg-muted'}`}>2</div>
          <span className="text-sm font-medium hidden sm:inline">Practice Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-xl">What type of practice do you have?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = type === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg text-left transition ${isSelected ? 'border-primary bg-medical-soft' : 'hover:bg-muted/50 border-border'}`}
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${isSelected ? 'bg-medical-gradient text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-sm text-muted-foreground">{opt.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </button>
                )
              })}

              <div className="bg-muted/40 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium mb-2">Free Plan Includes:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Public listing</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Search visibility</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Appointment booking</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Basic dashboard</div>
                </div>
              </div>

              <Button type="button" className="w-full bg-medical-gradient" onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Practice / Doctor Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. John Doe / Wellness Pharmacy" required />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline (short headline)</Label>
                  <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Cardiologist with 15+ years experience" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell patients about your practice, services, and approach to care..." rows={4} />
                </div>
              </CardContent>
            </Card>

            {/* Doctor-specific */}
            {type === 'DOCTOR' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" /> Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="specialty">Primary Specialty</Label>
                      <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Cardiologist" />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input id="qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="MBBS, MD (Medicine), DM (Cardiology)" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input id="experience" type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="15" min={0} />
                    </div>
                    <div>
                      <Label htmlFor="fee">Consultation Fee (₹)</Label>
                      <Input id="fee" type="number" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="800" min={0} />
                    </div>
                    <div>
                      <Label htmlFor="regno">Registration No.</Label>
                      <Input id="regno" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} placeholder="KMC-12345" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi, Marathi" />
                  </div>
                  <div>
                    <Label htmlFor="issues">Health Issues Treated (comma-separated)</Label>
                    <Input id="issues" value={healthIssues} onChange={(e) => setHealthIssues(e.target.value)} placeholder="Heart Disease, Hypertension, Diabetes" />
                  </div>
                  <div>
                    <Label htmlFor="about">About</Label>
                    <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Detailed bio about your experience, approach, and specializations..." rows={3} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Contact & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="contact@practice.com" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website (optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="pl-9" placeholder="https://yourpractice.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address, building, area..." rows={2} />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
                  </div>
                  <div>
                    <Label htmlFor="area">Area / Locality</Label>
                    <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Bandra West" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400050" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-medical-gradient" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Create Listing (Free Plan)
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
