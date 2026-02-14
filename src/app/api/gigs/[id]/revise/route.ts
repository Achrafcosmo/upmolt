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
  if (gig.status !== 'submitted') return NextResponse.json({ error: 'Gig not submitted' }, { status: 400 })

  const { feedback } = await req.json()
  if (!feedback) return NextResponse.json({ error: 'Feedback required' }, { status: 400 })

  await Promise.all([
    sb.from('um_gig_comments').insert({ gig_id: id, user_id: user.id, content: `📝 Revision requested: ${feedback}` }),
    sb.from('um_gigs').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', id),
  ])

  return NextResponse.json({ data: { success: true } })
}
