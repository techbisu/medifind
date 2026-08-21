import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/geocode
 * Body: { address: string, city?: string, pincode?: string }
 *
 * Returns: { lat, lng, formatted: string, source: 'mapbox' | 'google' | 'none' }
 *
 * Provider priority:
 *   1. Mapbox (if NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN or MAPBOX_ACCESS_TOKEN set) — 50k/mo free
 *   2. Google Maps (if GOOGLE_MAPS_API_KEY set) — $200/mo credit
 *   3. None — returns null coordinates (caller falls back to manual entry)
 *
 * Note: Mapbox token is safe to expose client-side (NEXT_PUBLIC_ prefix).
 *       Google server-side key is restricted to geocoding only (set referrer/IP restrictions in Google Cloud Console).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address, city, pincode } = body

    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      return NextResponse.json(
        { error: 'Address must be at least 3 characters' },
        { status: 400 }
      )
    }

    const fullAddress = [address, city, pincode, 'India'].filter(Boolean).join(', ')

    // 1. Try Mapbox first (more generous free tier)
    const mapboxToken =
      process.env.MAPBOX_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (mapboxToken) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&country=in&limit=1`
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          const data = await res.json()
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center
            return NextResponse.json({
              lat,
              lng,
              formatted: data.features[0].place_name,
              source: 'mapbox',
            })
          }
        }
      } catch (err) {
        console.error('Mapbox geocode failed:', err)
      }
    }

    // 2. Try Google Maps Geocoding API
    const googleKey = process.env.GOOGLE_MAPS_API_KEY
    if (googleKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&components=country:IN&key=${googleKey}`
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          const data = await res.json()
          if (data.results && data.results.length > 0) {
            const loc = data.results[0].geometry.location
            return NextResponse.json({
              lat: loc.lat,
              lng: loc.lng,
              formatted: data.results[0].formatted_address,
              source: 'google',
            })
          }
        }
      } catch (err) {
        console.error('Google geocode failed:', err)
      }
    }

    // 3. No provider configured
    return NextResponse.json({
      lat: null,
      lng: null,
      formatted: null,
      source: 'none',
      message:
        'No maps provider configured. Set MAPBOX_ACCESS_TOKEN or GOOGLE_MAPS_API_KEY in .env to auto-fill coordinates.',
    })
  } catch (e) {
    console.error('Geocode error:', e)
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    )
  }
}

/** GET /api/geocode — returns which providers are configured (for frontend feature flags). */
export async function GET() {
  return NextResponse.json({
    mapbox: !!(
      process.env.MAPBOX_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    ),
    google: !!process.env.GOOGLE_MAPS_API_KEY,
    googleMapsClientKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null,
    mapboxClientKey: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || null,
  })
}
