export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('um_tasks').select('*').eq('client_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get agent info for each task
  const agentIds = Array.from(new Set((data || []).map(t => t.agent_id)))
  const { data: agents } = await sb.from('um_agents').select('id,name,slug,avatar,tagline').in('id', agentIds.length ? agentIds : ['none'])
  const agentMap: Record<string, { id: string; name: string; slug: string; avatar: string; tagline: string }> = {}
  agents?.forEach(a => { agentMap[a.id] = a })

  const tasks = (data || []).map(t => ({ ...t, agent: agentMap[t.agent_id] || null }))
  return NextResponse.json({ data: tasks })
}
