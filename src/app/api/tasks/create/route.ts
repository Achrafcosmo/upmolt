export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const TIER_MULT: Record<string, number> = { basic: 1, standard: 2, premium: 3.5 }

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { agent_id, title, description, tier } = await req.json()
  if (!agent_id || !title) return NextResponse.json({ error: 'Agent and title required' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: agent } = await sb.from('um_agents').select('*').eq('id', agent_id).single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const mult = TIER_MULT[tier] || 1
  const price_usd = Math.round(agent.price_usd * mult)
  const saved_usd = Math.max(0, agent.market_rate_usd * mult - price_usd)

  const { data: task, error } = await sb.from('um_tasks').insert({
    client_id: user.id, agent_id, title, description: description || '',
    tier: tier || 'basic', price_usd, saved_usd, status: 'pending',
    payment_status: 'pending'
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update agent task count
  await sb.from('um_agents').update({ total_tasks: agent.total_tasks + 1 }).eq('id', agent_id)
  // Update user savings
  await sb.from('um_users').update({ total_saved_usd: (user.total_saved_usd || 0) + saved_usd }).eq('id', user.id)

  // Don't auto-process — wait for payment confirmation
  return NextResponse.json({ data: task })
}
