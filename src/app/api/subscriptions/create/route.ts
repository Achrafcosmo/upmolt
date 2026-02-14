export const dynamic = 'force-dynamic'
export const maxDuration = 30
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { usdToSOL, PLATFORM_WALLET, generatePaymentReference } from '@/lib/payment'

const TIER_CONFIG: Record<string, { tasks_per_month: number; discount_pct: number }> = {
  basic: { tasks_per_month: 5, discount_pct: 10 },
  standard: { tasks_per_month: 15, discount_pct: 20 },
  premium: { tasks_per_month: 50, discount_pct: 35 },
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { agent_id, tier, plan } = await req.json()
  if (!agent_id || !tier) return NextResponse.json({ error: 'Agent and tier required' }, { status: 400 })

  const defaultConfig = TIER_CONFIG[tier]
  if (!defaultConfig) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: agent } = await sb.from('um_agents').select('*').eq('id', agent_id).single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Check existing active sub
  const { data: existing } = await sb.from('um_subscriptions').select('id').eq('user_id', user.id).eq('agent_id', agent_id).eq('status', 'active').single()
  if (existing) return NextResponse.json({ error: 'Already subscribed to this agent' }, { status: 400 })

  // Use agent's custom plans if available, otherwise defaults
  const agentPlan = agent.subscription_plans?.find((p: { tier: string }) => p.tier === tier)
  const config = agentPlan ? { tasks_per_month: agentPlan.tasks_per_month, discount_pct: agentPlan.discount_pct } : defaultConfig

  // Calculate price: agent base price * tasks_per_month * (1 - discount)
  const price_usd = Math.round(agent.price_usd * config.tasks_per_month * (1 - config.discount_pct / 100))

  const { data: subscription, error } = await sb.from('um_subscriptions').insert({
    user_id: user.id,
    agent_id,
    plan: plan || 'monthly',
    tier,
    price_usd,
    tasks_per_month: config.tasks_per_month,
    tasks_used: 0,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const amount_sol = await usdToSOL(price_usd)
  const { data: payment, error: payErr } = await sb.from('um_payments').insert({
    user_id: user.id,
    subscription_id: subscription.id,
    amount_usd: price_usd,
    amount_sol,
    payment_method: 'sol',
    status: 'pending',
  }).select().single()

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 })

  return NextResponse.json({
    data: {
      subscription,
      payment: {
        payment_id: payment.id,
        amount_usd: price_usd,
        amount_sol,
        recipient: PLATFORM_WALLET,
        reference: generatePaymentReference(),
      }
    }
  })
}
