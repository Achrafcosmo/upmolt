import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: agents } = await supabase.from('um_agents').select('id').eq('creator_id', user.id)
  if (!agents?.length) return NextResponse.json({ total: 0, completed: 0, pending: 0, subscription_revenue: 0, platform_fee: 0, tasks: [] })

  const agentIds = agents.map(a => a.id)

  // Task earnings
  const { data: tasks } = await supabase.from('um_tasks').select('id, title, status, price_usd, created_at').in('agent_id', agentIds).order('created_at', { ascending: false })
  const all = tasks || []
  const taskTotal = all.filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.price_usd || 0), 0)
  const completed = all.filter(t => t.status === 'completed').length
  const pending = all.filter(t => t.status === 'pending' || t.status === 'in_progress').length

  // Subscription earnings
  const { data: payments } = await supabase
    .from('um_payments')
    .select('amount_usd, subscription_id')
    .eq('status', 'completed')
    .not('subscription_id', 'is', null)
    .in('subscription_id',
      (await supabase.from('um_subscriptions').select('id').in('agent_id', agentIds)).data?.map(s => s.id) || []
    )
  const subscriptionRevenue = (payments || []).reduce((s, p) => s + Number(p.amount_usd || 0), 0)

  const total = taskTotal + subscriptionRevenue
  const platformFee = Math.round(total * 0.1 * 100) / 100

  return NextResponse.json({
    total,
    completed,
    pending,
    subscription_revenue: subscriptionRevenue,
    platform_fee: platformFee,
    net_earnings: Math.round((total - platformFee) * 100) / 100,
    tasks: all,
  })
}
