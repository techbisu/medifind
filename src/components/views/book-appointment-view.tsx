'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Calendar, Clock, User, Phone, Mail, Heart, ArrowLeft, CheckCircle2,
  Loader2, Stethoscope, MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import type { ProviderDTO } from '@/lib/providers'
import { DAYS_OF_WEEK } from '@/lib/providers'

export function BookAppointmentView() {
  const { selectedProvider, selectedProviderSlug, setView, user } = useAppStore()
  const [provider, setProvider] = useState<ProviderDTO | null>(selectedProvider)
  const [chambers, setChambers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<any>(null)

  // Form state
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [healthIssue, setHealthIssue] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedChamber, setSelectedChamber] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  useEffect(() => {
    if (!selectedProviderSlug) {
      setView('home')
      return
    }
    let cancelled = false
    // Always fetch fresh data with chambers
    fetch(`/api/providers/${selectedProviderSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.provider) {
          setProvider(d.provider)
          setChambers(d.provider.chambers || [])
          if (d.provider.chambers?.length === 1) {
            setSelectedChamber(d.provider.chambers[0].id)
          }
        }
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedProviderSlug])

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Provider not found.</p>
        <Button onClick={() => setView('home')} className="mt-4">Back to Home</Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 animate-fade-in">
        <Card className="border-primary/30">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Appointment Requested!</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ve received your appointment request. The provider will confirm your slot shortly via phone.
            </p>
            <Card className="text-left mb-6 bg-muted/30">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-mono font-medium">{success.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{success.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{success.preferredDate} {success.preferredTime || ''}</span>
                </div>
                {success.fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span className="font-medium">₹{success.fee}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setView('home')}>Back to Home</Button>
              <Button onClick={() => setView('search')}>Browse More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Build available time slots from selected chamber
  const selectedChamberObj = chambers.find(c => c.id === selectedChamber)
  const availableSlots: { date: string; day: string; slots: string[] }[] = []

  if (selectedChamberObj) {
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()
      const daySchedules = (selectedChamberObj.schedules || []).filter((s: any) => s.dayOfWeek === dayOfWeek && s.isAvailable)
      if (daySchedules.length > 0) {
        const slots: string[] = []
        daySchedules.forEach((s: any) => {
          // Generate slots every 30 mins
          const [sh, sm] = s.startTime.split(':').map(Number)
          const [eh, em] = s.endTime.split(':').map(Number)
          let totalMins = sh * 60 + sm
          const endMins = eh * 60 + em
          while (totalMins < endMins) {
            const h = Math.floor(totalMins / 60)
            const m = totalMins % 60
            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
            totalMins += 30
          }
        })
        if (slots.length > 0) {
          availableSlots.push({
            date: date.toISOString().split('T')[0],
            day: DAYS_OF_WEEK[dayOfWeek],
            slots: slots.slice(0, 10),
          })
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !selectedDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          chamberId: selectedChamber || null,
          patientName: name,
          patientPhone: phone,
          patientEmail: email,
          patientAge: age,
          patientGender: gender,
          healthIssue,
          notes,
          preferredDate: selectedDate,
          preferredTime: selectedTime,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setSuccess(data.appointment)
        toast.success('Appointment requested successfully!')
      }
    } catch (err) {
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => setView('provider-detail')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Profile
      </Button>

      {/* Provider Summary */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-medical-soft text-primary font-bold">
              {provider.name.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{provider.name}</h2>
            <p className="text-sm text-muted-foreground">
              {provider.doctorProfile?.specialty || provider.tagline}
            </p>
            {provider.doctorProfile?.consultationFee ? (
              <Badge variant="outline" className="mt-1 bg-medical-soft text-primary">
                Consultation Fee: ₹{provider.doctorProfile.consultationFee}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="35" min={0} max={120} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="issue">Health Issue / Reason for Visit</Label>
                <Textarea
                  id="issue"
                  value={healthIssue}
                  onChange={(e) => setHealthIssue(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requests or information for the doctor..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chamber & Slot Selection (doctors only) */}
          {provider.type === 'DOCTOR' && chambers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Select Chamber & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chambers.length > 1 && (
                  <div>
                    <Label>Select Chamber</Label>
                    <RadioGroup value={selectedChamber} onValueChange={setSelectedChamber} className="space-y-2 mt-2">
                      {chambers.map((c: any) => (
                        <div key={c.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                          <RadioGroupItem value={c.id} id={c.id} className="mt-1" />
                          <Label htmlFor={c.id} className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">{c.name}</div>
                            {c.address && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{c.address}</div>}
                            {c.visitingHours && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{c.visitingHours}</div>}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {selectedChamber && availableSlots.length > 0 && (
                  <div>
                    <Label>Available Slots (next 14 days)</Label>
                    <div className="space-y-3 mt-2 max-h-80 overflow-y-auto scroll-thin pr-2">
                      {availableSlots.map((daySlots) => (
                        <div key={daySlots.date} className="border rounded-lg p-3">
                          <div className="text-sm font-medium mb-2 flex items-center justify-between">
                            <span>{daySlots.day}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(daySlots.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {daySlots.slots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => { setSelectedDate(daySlots.date); setSelectedTime(slot) }}
                                className={`text-xs px-2 py-1.5 rounded border transition ${
                                  selectedDate === daySlots.date && selectedTime === slot
                                    ? 'bg-medical-gradient text-white border-transparent'
                                    : 'hover:bg-medical-soft hover:border-primary/40'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChamber && availableSlots.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    No available slots in the next 14 days for this chamber.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* For non-doctor providers - just date selection */}
          {provider.type !== 'DOCTOR' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Preferred Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select your preferred date for visiting the {provider.type === 'MEDICAL_SHOP' ? 'pharmacy' : 'lab'}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Summary Sidebar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium text-right">{provider.name}</span>
              </div>
              {provider.doctorProfile?.specialty && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty</span>
                  <span className="font-medium">{provider.doctorProfile.specialty}</span>
                </div>
              )}
              {selectedChamberObj && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chamber</span>
                  <span className="font-medium text-right text-xs">{selectedChamberObj.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDate || '—'}</span>
              </div>
              {selectedTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              )}
              {provider.doctorProfile?.consultationFee ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-bold">₹{provider.doctorProfile.consultationFee}</span>
                </div>
              ) : null}
              <Separator />
              <div className="text-xs text-muted-foreground">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Appointment is free to request. Pay consultation fee directly at the clinic.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>You&apos;ll receive a confirmation call within 2 hours.</span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-medical-gradient"
                disabled={submitting || !selectedDate}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Booking...</>
                ) : (
                  <><Calendar className="h-4 w-4 mr-2" /> Confirm Booking</>
                )}
              </Button>
              {!selectedDate && (
                <p className="text-xs text-center text-muted-foreground">Select a date to continue</p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
