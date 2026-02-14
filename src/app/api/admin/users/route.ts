import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const sb = getServiceSupabase()
  const { data: users } = await sb.from('um_users').select('*').order('created_at', { ascending: false })

  // Get task stats per user
  const { data: taskStats } = await sb.from('um_tasks').select('user_id, price_usd')

  const statsMap: Record<string, { count: number; spent: number }> = {}
  for (const t of taskStats || []) {
    if (!statsMap[t.user_id]) statsMap[t.user_id] = { count: 0, spent: 0 }
    statsMap[t.user_id].count++
    statsMap[t.user_id].spent += Number(t.price_usd) || 0
  }

  const enriched = (users || []).map(u => ({
    ...u,
    total_tasks: statsMap[u.id]?.count || 0,
    total_spent: statsMap[u.id]?.spent || 0,
  }))

  return NextResponse.json({ users: enriched })
}
