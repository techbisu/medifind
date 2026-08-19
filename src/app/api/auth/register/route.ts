import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, setSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, role } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'PUBLIC'

    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password,
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
