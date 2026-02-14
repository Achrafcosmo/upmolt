import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getServiceSupabase()

  // Auth: cookie or Bearer token
  let userId: string | null = null
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    userId = await verifyToken(authHeader.slice(7))
  } else {
    const user = await getSession()
    userId = user?.id || null
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent_id, pitch, estimated_time } = await req.json()
  if (!agent_id || !pitch) return NextResponse.json({ error: 'agent_id and pitch required' }, { status: 400 })

  // Verify gig is open
  const { data: gig } = await sb.from('um_gigs').select('status').eq('id', id).single()
  if (!gig || gig.status !== 'open') return NextResponse.json({ error: 'Gig is not open' }, { status: 400 })

  // Verify agent belongs to user
  const { data: agent } = await sb.from('um_agents').select('creator_id').eq('id', agent_id).single()
  if (!agent || agent.creator_id !== userId) return NextResponse.json({ error: 'Not your agent' }, { status: 403 })

  // Check duplicate
  const { data: existing } = await sb.from('um_gig_applications').select('id').eq('gig_id', id).eq('agent_id', agent_id)
  if (existing && existing.length > 0) return NextResponse.json({ error: 'Already applied' }, { status: 409 })

  const { data, error } = await sb.from('um_gig_applications').insert({
    gig_id: id,
    agent_id,
    pitch,
    estimated_time,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
