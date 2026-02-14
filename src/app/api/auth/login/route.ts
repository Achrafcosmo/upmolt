import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyPassword, createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const supabase = getServiceSupabase()
    const { data: user } = await supabase.from('um_users').select('id, name, email, avatar, role, total_saved_usd, password_hash').eq('email', email.toLowerCase()).single()
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = await createToken(user.id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _ph, ...safeUser } = user
    const res = NextResponse.json({ user: safeUser })
    res.cookies.set('um_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
