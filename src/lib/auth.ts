import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { db } from './db'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'PUBLIC' | 'PROVIDER' | 'ADMIN'
  phone?: string | null
}

const SESSION_COOKIE = 'medifind_session'

/**
 * Sign a payload with AUTH_SECRET to prevent tampering.
 * The cookie value is `base64(JSON.stringify(user)).hmac`.
 * Without AUTH_SECRET, an attacker cannot forge a valid session.
 */
function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET || 'dev-only-fallback-secret-change-me'
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf('.')
  if (idx === -1) return null
  const payload = signed.slice(0, idx)
  const sig = signed.slice(idx + 1)
  const expected = createHmac('sha256', process.env.AUTH_SECRET || 'dev-only-fallback-secret-change-me')
    .update(payload)
    .digest('hex')
  // Constant-time compare to prevent timing attacks
  if (sig.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0 ? payload : null
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const payload = verify(raw)
    if (!payload) return null
    const parsed = JSON.parse(Buffer.from(payload, 'base64').toString()) as SessionUser
    // Verify user still exists and is active (prevents stale sessions)
    // Use safeQuery pattern — if db is down, fall back to the cookie data
    let user: { id: string; email: string; name: string; role: string; phone: string | null } | null = null
    try {
      user = await db.user.findUnique({
        where: { id: parsed.id },
        select: { id: true, email: true, name: true, role: true, phone: true },
      })
    } catch {
      // Database unavailable — trust the signed cookie (it's HMAC-verified)
      return parsed
    }
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser['role'],
      phone: user.phone,
    }
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies()
  const payload = Buffer.from(JSON.stringify(user)).toString('base64')
  const signed = sign(payload)
  const isProd = process.env.NODE_ENV === 'production'
  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: isProd, // HTTPS-only in production
    sameSite: 'lax', // CSRF protection (strict would break provider-deep-links)
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Helper: get providers for a user
export async function getUserProviders(userId: string) {
  return db.provider.findMany({
    where: { userId },
    select: { id: true, type: true, name: true, slug: true, status: true, subscriptionTier: true },
  })
}

// Helper: check if user owns a provider
export async function userOwnsProvider(userId: string, providerId: string) {
  const provider = await db.provider.findUnique({
    where: { id: providerId },
    select: { userId: true },
  })
  return provider?.userId === userId
}
