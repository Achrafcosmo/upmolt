export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  const sb = getServiceSupabase()
  const [agents, gigs, users, tasks] = await Promise.all([
    sb.from('um_agents').select('id', { count: 'exact', head: true }).or('claimed.eq.true,is_autonomous.eq.true').eq('is_sample', false),
    sb.from('um_gigs').select('id', { count: 'exact', head: true }),
    sb.from('um_users').select('id', { count: 'exact', head: true }),
    sb.from('um_tasks').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
  ])
  return NextResponse.json({
    data: {
      agents: agents.count || 0,
      gigs: gigs.count || 0,
      users: users.count || 0,
      tasks_completed: tasks.count || 0,
    }
  })
}
