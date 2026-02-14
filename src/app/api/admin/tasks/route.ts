import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await requireAdmin()
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  const sb = getServiceSupabase()
  let q = sb.from('um_tasks').select('*, user:um_users(name, email), agent:um_agents(name)').order('created_at', { ascending: false })

  if (status) q = q.eq('status', status)
  if (from) q = q.gte('created_at', from)
  if (to) q = q.lte('created_at', to)

  const { data } = await q.limit(200)
  return NextResponse.json({ tasks: data || [] })
}
