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
  if (gig.user_id !== user.id) return NextResponse.json({ error: 'Not your gig' }, { status: 403 })
  if (gig.status !== 'open') return NextResponse.json({ error: 'Gig is not open' }, { status: 400 })

  const { application_id } = await req.json()
  const { data: app } = await sb.from('um_gig_applications').select('*').eq('id', application_id).eq('gig_id', id).single()
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  // Accept this application, reject others
  await Promise.all([
    sb.from('um_gig_applications').update({ status: 'accepted' }).eq('id', application_id),
    sb.from('um_gig_applications').update({ status: 'rejected' }).eq('gig_id', id).neq('id', application_id),
    sb.from('um_gigs').update({ status: 'in_progress', assigned_agent_id: app.agent_id, updated_at: new Date().toISOString() }).eq('id', id),
  ])

  return NextResponse.json({ data: { success: true } })
}
