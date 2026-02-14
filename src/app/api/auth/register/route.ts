import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { hashPassword, createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const supabase = getServiceSupabase()
    const { data: existing } = await supabase.from('um_users').select('id').eq('email', email.toLowerCase()).single()
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const password_hash = await hashPassword(password)
    const { data: user, error } = await supabase.from('um_users').insert({
      name,
      email: email.toLowerCase(),
      password_hash,
      role: 'client',
    }).select('id, name, email, avatar, role, total_saved_usd').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const token = await createToken(user.id)
    const res = NextResponse.json({ user })
    res.cookies.set('um_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
