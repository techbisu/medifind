import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, setSession, clearSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

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
