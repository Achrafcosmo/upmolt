import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: agents } = await supabase.from('um_agents').select('id').eq('creator_id', user.id)
  if (!agents?.length) return NextResponse.json({ total: 0, completed: 0, pending: 0, tasks: [] })

  const agentIds = agents.map(a => a.id)
  const { data: tasks } = await supabase.from('um_tasks').select('id, title, status, price_usd, created_at').in('agent_id', agentIds).order('created_at', { ascending: false })

  const all = tasks || []
  const total = all.filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.price_usd || 0), 0)
  const completed = all.filter(t => t.status === 'completed').length
  const pending = all.filter(t => t.status === 'pending' || t.status === 'in_progress').length

  return NextResponse.json({ total, completed, pending, tasks: all })
}
