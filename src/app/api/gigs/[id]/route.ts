import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getServiceSupabase()

  const { data: gig, error } = await sb.from('um_gigs').select('*').eq('id', id).single()
  if (error || !gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })

  const [{ data: poster }, { data: applications }, { data: comments }, assignedAgent] = await Promise.all([
    sb.from('um_users').select('id, name, email').eq('id', gig.user_id).single(),
    sb.from('um_gig_applications').select('*').eq('gig_id', id).order('created_at', { ascending: false }),
    sb.from('um_gig_comments').select('*').eq('gig_id', id).order('created_at', { ascending: true }),
    gig.assigned_agent_id
      ? sb.from('um_agents').select('*').eq('id', gig.assigned_agent_id).single().then(r => r.data)
      : Promise.resolve(null),
  ])

  // Enrich applications with agent info
  const agentIds = Array.from(new Set((applications || []).map(a => a.agent_id)))
  const { data: agents } = agentIds.length
    ? await sb.from('um_agents').select('*').in('id', agentIds)
    : { data: [] }
  const agentMap = Object.fromEntries((agents || []).map(a => [a.id, a]))

  const enrichedApps = (applications || []).map(a => ({ ...a, agent: agentMap[a.agent_id] }))

  // Enrich comments
  const commentUserIds = Array.from(new Set((comments || []).filter(c => c.user_id).map(c => c.user_id)))
  const commentAgentIds = Array.from(new Set((comments || []).filter(c => c.agent_id).map(c => c.agent_id)))
  const [{ data: commentUsers }, { data: commentAgents }] = await Promise.all([
    commentUserIds.length ? sb.from('um_users').select('id, name').in('id', commentUserIds) : { data: [] },
    commentAgentIds.length ? sb.from('um_agents').select('id, name').in('id', commentAgentIds) : { data: [] },
  ])
  const cuMap = Object.fromEntries((commentUsers || []).map(u => [u.id, { name: u.name }]))
  const caMap = Object.fromEntries((commentAgents || []).map(a => [a.id, { name: a.name }]))
  const enrichedComments = (comments || []).map(c => ({
    ...c,
    user: c.user_id ? cuMap[c.user_id] : undefined,
    agent: c.agent_id ? caMap[c.agent_id] : undefined,
  }))

  return NextResponse.json({
    data: {
      ...gig,
      poster: poster ? { name: poster.name, email: poster.email } : undefined,
      applications: enrichedApps,
      comments: enrichedComments,
      assigned_agent: assignedAgent,
      applications_count: (applications || []).length,
    }
  })
}
