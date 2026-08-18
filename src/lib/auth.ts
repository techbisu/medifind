import { cookies } from 'next/headers'
import { db } from './db'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'PUBLIC' | 'PROVIDER' | 'ADMIN'
  phone?: string | null
}

const SESSION_COOKIE = 'medifind_session'

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SessionUser
    // Verify user still exists
    const user = await db.user.findUnique({
      where: { id: parsed.id },
      select: { id: true, email: true, name: true, role: true, phone: true },
    })
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
  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: 'lax',
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
