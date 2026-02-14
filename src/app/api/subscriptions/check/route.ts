export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const agentId = req.nextUrl.searchParams.get('agent_id')
  if (!agentId) return NextResponse.json({ error: 'agent_id required' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: sub } = await sb
    .from('um_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('agent_id', agentId)
    .eq('status', 'active')
    .single()

  if (!sub) return NextResponse.json({ data: { hasSubscription: false } })

  return NextResponse.json({
    data: {
      hasSubscription: true,
      subscription: sub,
      tasksRemaining: sub.tasks_per_month - sub.tasks_used,
    }
  })
}
