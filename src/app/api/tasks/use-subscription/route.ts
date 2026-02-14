export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { task_id, subscription_id } = await req.json()
  if (!task_id || !subscription_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: sub } = await sb.from('um_subscriptions').select('*').eq('id', subscription_id).eq('user_id', user.id).eq('status', 'active').single()
  if (!sub) return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  if (sub.tasks_used >= sub.tasks_per_month) return NextResponse.json({ error: 'No tasks remaining' }, { status: 400 })

  await sb.from('um_subscriptions').update({ tasks_used: sub.tasks_used + 1 }).eq('id', subscription_id)
  await sb.from('um_tasks').update({ payment_status: 'paid' }).eq('id', task_id)

  return NextResponse.json({ data: { success: true } })
}
