import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { setSession, clearSession, getSession } from '@/lib/auth'
import { verifyPassword, isBcryptHash } from '@/lib/password'

const LoginSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z.string().min(1).max(200),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { email, password } = parsed.data

    const user = await db.user.findUnique({
      where: { email },
    })

    // Generic error to prevent email enumeration
    const invalidCreds = () =>
      NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    if (!user) return invalidCreds()

    // Backward-compat: if password is plaintext (legacy seed), verify directly
    // and transparently upgrade to bcrypt hash on next login.
    let valid = false
    if (isBcryptHash(user.password)) {
      valid = await verifyPassword(password, user.password)
    } else if (user.password === password) {
      // Legacy plaintext match — upgrade to bcrypt immediately
      valid = true
      const { hashPassword } = await import('@/lib/password')
      const newHash = await hashPassword(password)
      await db.user.update({
        where: { id: user.id },
        data: { password: newHash },
      })
    }

    if (!valid) return invalidCreds()

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'PUBLIC' | 'PROVIDER' | 'ADMIN',
      phone: user.phone,
    }

    await setSession(sessionUser)
    return NextResponse.json({ user: sessionUser })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ success: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user: session })
}
