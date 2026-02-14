import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const sb = getServiceSupabase()

  const [{ count: totalUsers }, { count: totalAgents }, { data: tasks }] = await Promise.all([
    sb.from('um_users').select('*', { count: 'exact', head: true }),
    sb.from('um_agents').select('*', { count: 'exact', head: true }),
    sb.from('um_tasks').select('price_usd, status, created_at'),
  ])

  const totalRevenue = (tasks || []).reduce((s, t) => s + (Number(t.price_usd) || 0), 0)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

  const tasksThisMonth = (tasks || []).filter(t => t.created_at >= monthStart).length

  const { count: newUsersWeek } = await sb.from('um_users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo)

  return NextResponse.json({
    totalRevenue,
    totalUsers: totalUsers || 0,
    totalAgents: totalAgents || 0,
    totalTasks: (tasks || []).length,
    tasksThisMonth,
    newUsersWeek: newUsersWeek || 0,
  })
}
