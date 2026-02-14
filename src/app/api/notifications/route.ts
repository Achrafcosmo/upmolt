import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data } = await sb.from('um_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ notifications: data || [] })
}

export async function PUT(req: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const sb = getServiceSupabase()

  if (body.markAllRead) {
    await sb.from('um_notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  } else if (body.id) {
    await sb.from('um_notifications').update({ read: true }).eq('id', body.id).eq('user_id', user.id)
  }

  return NextResponse.json({ ok: true })
}
