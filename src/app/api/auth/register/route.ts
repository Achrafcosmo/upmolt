export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { hashPassword, createToken, sessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be 6+ characters' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: existing } = await sb.from('um_users').select('id').eq('email', email.toLowerCase()).single()
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const password_hash = await hashPassword(password)
  const { data: user, error } = await sb.from('um_users').insert({
    name, email: email.toLowerCase(), password_hash, role: 'client'
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const token = await createToken(user.id)
  const res = NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } })
  res.cookies.set(sessionCookie(token))
  return res
}
