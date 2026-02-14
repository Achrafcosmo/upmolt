export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: sub } = await sb.from('um_subscriptions').select('*').eq('id', params.id).single()
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (sub.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await sb.from('um_subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', params.id)
  return NextResponse.json({ data: { success: true } })
}
