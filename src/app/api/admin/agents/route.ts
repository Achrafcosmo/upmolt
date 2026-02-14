import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const sb = getServiceSupabase()
  const { data: agents } = await sb.from('um_agents').select('*, category:um_categories(name)').order('created_at', { ascending: false })

  const { data: taskStats } = await sb.from('um_tasks').select('agent_id, price_usd')
  const statsMap: Record<string, { count: number; revenue: number }> = {}
  for (const t of taskStats || []) {
    if (!t.agent_id) continue
    if (!statsMap[t.agent_id]) statsMap[t.agent_id] = { count: 0, revenue: 0 }
    statsMap[t.agent_id].count++
    statsMap[t.agent_id].revenue += Number(t.price_usd) || 0
  }

  const enriched = (agents || []).map(a => ({
    ...a,
    stat_tasks: statsMap[a.id]?.count || 0,
    stat_revenue: statsMap[a.id]?.revenue || 0,
  }))

  return NextResponse.json({ agents: enriched })
}
