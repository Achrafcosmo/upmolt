import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: gigs } = await sb.from('um_gigs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  const gigIds = (gigs || []).map(g => g.id)
  const { data: apps } = gigIds.length
    ? await sb.from('um_gig_applications').select('gig_id').in('gig_id', gigIds)
    : { data: [] }

  const appCounts: Record<string, number> = {}
  for (const a of apps || []) appCounts[a.gig_id] = (appCounts[a.gig_id] || 0) + 1

  return NextResponse.json({
    data: (gigs || []).map(g => ({ ...g, applications_count: appCounts[g.id] || 0 }))
  })
}
