import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { setSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

const RegisterSchema = z.object({
  email: z.string().email('Valid email required').max(200).toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(200),
  name: z.string().min(2, 'Name must be at least 2 characters').max(120).trim(),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['PUBLIC', 'PROVIDER']).optional().default('PUBLIC'),
})

// Basic rate limiting — in production use Upstash/Redis for distributed rate limiting
const signupAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // 5 signups per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = signupAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    signupAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { email, password, name, phone, role } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'PUBLIC'

    const user = await db.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        phone: phone || null,
        role: userRole,
      },
    })

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'PUBLIC' | 'PROVIDER' | 'ADMIN',
      phone: user.phone,
    }

    await setSession(sessionUser)
    return NextResponse.json({ user: sessionUser }, { status: 201 })
  } catch (e) {
    console.error('Registration error:', e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
