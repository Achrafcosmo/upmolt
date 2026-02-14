export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyPassword, createToken, sessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: user } = await sb.from('um_users').select('*').eq('email', email.toLowerCase()).single()
  if (!user || !user.password_hash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await createToken(user.id)
  const res = NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } })
  res.cookies.set(sessionCookie(token))
  return res
}
