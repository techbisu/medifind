# MediFind — Healthcare Provider SaaS Platform

A comprehensive medical marketplace SaaS where any healthcare provider (doctors, pharmacies, diagnostic labs) can list their practice and patients can search/book appointments publicly.

Built with **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Prisma + Zustand**.

## ✨ Features

### Public (no account required)
- 🔍 **Search** by name, specialty, health condition, city, or location
- 📍 **Nearby search** — "Use My Location" button + Haversine distance sorting + radius filter (2/5/10/25/50 km)
- 👨‍⚕️ **Browse providers** — Doctors, Medical Shops, Clinic & Labs
- 📅 **Book appointments** — pick chamber, date, time slot, enter patient details
- ⭐ **Reviews** — anyone can leave a rating + comment
- 🗺️ **Maps integration** — optional Mapbox/Google Maps for auto-geocoding on provider onboarding

### Provider SaaS (free to start)
- 📋 **2-step onboarding** — choose type → enter details, auto-subscribe to Free plan
- 🏥 **Multi-listing support** — one account can own multiple provider profiles
- ⏰ **Chamber management** — add own chambers OR chambers hosted at medical shops, weekly schedule builder
- 💊 **Shop services CRUD** — for medical shops
- 🧪 **Lab test CRUD** — for diagnostic labs, with discount pricing, fasting flags, sample types
- 📊 **Dashboard** — appointments with status filters (Pending/Confirmed/Completed/Cancelled), stats, profile views
- 🔒 **Booking toggle** — turn online booking on/off per provider (e.g., for vacations or walk-in only practices)
- 💳 **Subscription management** — switch between Free / Pro / Enterprise plans

### Super Admin
- 📈 **Stats dashboard** — providers by type, revenue, pending approvals, tier breakdown, recent signups
- ✅ **Provider approval workflow** — Approve / Suspend / Reject / Verify
- 📋 **Plans CRUD** — manage pricing tiers and features
- 💰 **Subscriptions overview** — track all active/expired subscriptions and revenue

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment (optional — works without maps keys)
cp .env.example .env

# Set up database
bun run db:push
bun run scripts/seed.ts

# Start dev server (auto-started in this sandbox)
# Visit http://localhost:3000
```

### Demo Accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@medifind.com` | `admin123` |
| Doctor | `doctor@medifind.com` | `doctor123` |
| Doctor 2 | `doctor2@medifind.com` | `doctor123` |
| Pharmacy | `shop@medifind.com` | `shop123` |
| Lab | `lab@medifind.com` | `lab123` |

## 🗺️ Maps Integration (Optional)

The app works fully without any maps API keys — nearby search uses the **Haversine formula** on stored `latitude`/`longitude` fields. To enable auto-geocoding (address → coordinates) on provider onboarding, add one of these to `.env`:

### Option 1: Mapbox (recommended — 50k free requests/month)
1. Get a free token at https://account.mapbox.com/access-tokens/
2. Add to `.env`:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...
   ```

### Option 2: Google Maps Platform ($200/month free credit)
1. Get an API key at https://console.cloud.google.com/google/maps-apis
2. **Restrict the key** to your domain in Google Cloud Console
3. Add to `.env`:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ```

### Option 3: Both (Mapbox takes priority for geocoding)
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk....
GOOGLE_MAPS_API_KEY=AIzaSy...
```

## 🔒 Booking Toggle

Each provider has a `bookingEnabled` boolean (defaults to `true`). When disabled:
- Public detail page shows "Online booking disabled" badge + "Call to Book" button instead of the booking form
- Provider card shows "Call to book" hint under the CTA button
- API returns 403 with a friendly message if someone tries to book
- Provider can toggle it on/off from the dashboard Overview tab

## 🏗️ Architecture

```
prisma/schema.prisma           # 13 models: User, Provider, DoctorProfile, Chamber, Schedule, Appointment, ShopService, LabTest, Review, Plan, Subscription, Specialty, HealthIssue
src/lib/
  db.ts                        # Prisma client (prod: errors/warns only)
  auth.ts                      # Cookie-based sessions
  providers.ts                 # DTO + helpers
  store.ts                     # Zustand store (auth, navigation, location)
src/app/api/
  auth/                        # Login / register / logout
  providers/                   # List + detail (with Haversine distance)
  appointments/                # Book + status updates (zod-validated)
  reviews/                     # Ratings + comments
  meta/                        # Specialties, cities, health issues
  plans/                       # Public pricing
  geocode/                     # Optional Mapbox/Google geocoding
  dashboard/                   # Provider self-service (CRUD for chambers/tests/services)
  admin/                       # Admin console APIs
src/components/
  header.tsx, footer.tsx       # Shared layout
  provider-card.tsx            # Card with distance badge
  views/                       # 9 view components (home, search, detail, booking, auth, plans, onboarding, provider dashboard, admin dashboard)
```

## 🔐 Security

- **Cookie-based auth** with httpOnly + sameSite=lax (7-day expiry)
- **Role-based access** — PUBLIC / PROVIDER / ADMIN
- **Owner checks** on all dashboard mutations
- **Input validation** via Zod on booking endpoint (extensible to others)
- **SQL injection protection** via Prisma parameterized queries
- **No secrets in client bundle** — server-side keys (GOOGLE_MAPS_API_KEY) stay server-side; only NEXT_PUBLIC_* keys are exposed (Mapbox tokens are designed for client exposure)

## 🚢 Production Deployment

### Recommended: Vercel
1. Push to GitHub
2. Import in Vercel
3. Add env vars from `.env.example`
4. Switch to PostgreSQL for production (change `provider` in `prisma/schema.prisma`)
5. Run `bun run db:push` once

### Self-hosted
```bash
bun install --production
bun run build
bun run start
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set `AUTH_SECRET` to a strong random string
- [ ] Switch Prisma to PostgreSQL/MySQL
- [ ] Add rate limiting (e.g., Upstash, or via Vercel Edge Middleware)
- [ ] Configure email/SMS for appointment notifications
- [ ] Enable HTTPS only (HSTS) via your host
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure backups for your database

## 📜 License

MIT — use this for your own medical marketplace, clinic chain, or healthcare startup.

## ⚠️ Disclaimer

This is a reference implementation. For real medical use, ensure compliance with local healthcare regulations (HIPAA in US, DPDP Act in India, GDPR in EU) — especially around patient data storage, consent, and audit logs.
