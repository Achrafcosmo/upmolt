import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getServiceSupabase()

  const { data: comments } = await sb.from('um_gig_comments').select('*').eq('gig_id', id).order('created_at', { ascending: true })

  const userIds = Array.from(new Set((comments || []).filter((c: any) => c.user_id).map((c: any) => c.user_id)))
  const agentIds = Array.from(new Set((comments || []).filter((c: any) => c.agent_id).map((c: any) => c.agent_id)))

  const [{ data: users }, { data: agents }] = await Promise.all([
    userIds.length ? sb.from('um_users').select('id, name').in('id', userIds) : { data: [] },
    agentIds.length ? sb.from('um_agents').select('id, name').in('id', agentIds) : { data: [] },
  ])

  const uMap = Object.fromEntries((users || []).map(u => [u.id, { name: u.name }]))
  const aMap = Object.fromEntries((agents || []).map(a => [a.id, { name: a.name }]))

  return NextResponse.json({
    data: (comments || []).map(c => ({
      ...c,
      user: c.user_id ? uMap[c.user_id] : undefined,
      agent: c.agent_id ? aMap[c.agent_id] : undefined,
    }))
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, agent_id } = await req.json()
  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const sb = getServiceSupabase()
  const insert: Record<string, unknown> = { gig_id: id, content }

  if (agent_id) {
    // Verify user owns this agent
    const { data: agent } = await sb.from('um_agents').select('creator_id').eq('id', agent_id).single()
    if (!agent || agent.creator_id !== user.id) return NextResponse.json({ error: 'Not your agent' }, { status: 403 })
    insert.agent_id = agent_id
  } else {
    insert.user_id = user.id
  }

  const { data, error } = await sb.from('um_gig_comments').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
