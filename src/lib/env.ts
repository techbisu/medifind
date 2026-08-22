/**
 * Validate required environment variables at startup.
 * Throws early if production-critical vars are missing.
 */

const REQUIRED_IN_PRODUCTION = [
  'AUTH_SECRET',
  'DATABASE_URL',
] as const

const OPTIONAL_WITH_DOCS = [
  { key: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN', docs: 'Optional. 50k free geocoding requests/month. Get at https://account.mapbox.com/access-tokens/' },
  { key: 'GOOGLE_MAPS_API_KEY', docs: 'Optional. $200/month free credit. Get at https://console.cloud.google.com/google/maps-apis' },
  { key: 'NEXT_PUBLIC_APP_URL', docs: 'Optional. Used for canonical URLs. Defaults to http://localhost:3000' },
] as const

let validated = false
let validationError: string | null = null

export function validateEnv() {
  if (validated) return { ok: !validationError, error: validationError }
  validated = true

  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key])
    if (missing.length > 0) {
      validationError = `Missing required environment variables: ${missing.join(', ')}`
      console.error(`❌ ${validationError}`)
      return { ok: false, error: validationError }
    }

    // Warn about weak AUTH_SECRET
    const secret = process.env.AUTH_SECRET
    if (secret && secret.length < 32) {
      console.warn('⚠️  AUTH_SECRET should be at least 32 characters for security')
    }
    if (secret === 'dev-only-fallback-secret-change-me') {
      console.error('❌ AUTH_SECRET is set to the dev fallback. Generate a strong secret: openssl rand -hex 32')
      validationError = 'AUTH_SECRET is using the dev fallback value'
      return { ok: false, error: validationError }
    }
  }

  // Log optional env status for visibility
  if (isProd) {
    OPTIONAL_WITH_DOCS.forEach(({ key, docs }) => {
      if (!process.env[key]) {
        console.info(`ℹ️  ${key} not set. ${docs}`)
      }
    })
  }

  return { ok: true, error: null }
}

/** Call this from middleware or layout to ensure env is validated before any request is handled. */
export function ensureEnvValidated() {
  return validateEnv()
}
