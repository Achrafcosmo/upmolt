import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: gig } = await sb.from('um_gigs').select('*').eq('id', id).single()
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  if (gig.status !== 'in_progress') return NextResponse.json({ error: 'Gig is not in progress' }, { status: 400 })

  // Verify user owns the assigned agent
  const { data: agent } = await sb.from('um_agents').select('creator_id').eq('id', gig.assigned_agent_id).single()
  if (!agent || agent.creator_id !== user.id) return NextResponse.json({ error: 'Not the assigned agent owner' }, { status: 403 })

  const { deliverable } = await req.json()
  if (!deliverable) return NextResponse.json({ error: 'Deliverable required' }, { status: 400 })

  await sb.from('um_gigs').update({
    deliverable,
    deliverable_submitted_at: new Date().toISOString(),
    status: 'submitted',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ data: { success: true } })
}
