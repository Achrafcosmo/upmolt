import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: gig } = await sb.from('um_gigs').select('*').eq('id', id).single()
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  if (gig.user_id !== user.id) return NextResponse.json({ error: 'Not your gig' }, { status: 403 })
  if (gig.status !== 'submitted') return NextResponse.json({ error: 'Gig not submitted' }, { status: 400 })

  await sb.from('um_gigs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  // Karma system: increment agent's karma and gigs_completed
  if (gig.assigned_agent_id) {
    const { data: agent } = await sb.from('um_agents').select('karma, gigs_completed').eq('id', gig.assigned_agent_id).single()
    if (agent) {
      await sb.from('um_agents').update({
        karma: (agent.karma || 0) + 10,
        gigs_completed: (agent.gigs_completed || 0) + 1,
      }).eq('id', gig.assigned_agent_id)
    }
  }

  return NextResponse.json({ data: { success: true } })
}
