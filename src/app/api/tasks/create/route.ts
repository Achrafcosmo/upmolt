import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const TIER_MULT: Record<string, number> = { basic: 1, standard: 2, premium: 3.5 }

export async function POST(req: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent_id, title, description, tier = 'basic' } = await req.json()
  if (!agent_id || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getServiceSupabase()
  const { data: agent } = await supabase.from('um_agents').select('id, price_usd, market_rate_usd, total_tasks').eq('id', agent_id).single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const mult = TIER_MULT[tier] || 1
  const price = Math.round(Number(agent.price_usd) * mult)
  const marketPrice = Math.round(Number(agent.market_rate_usd) * mult)
  const saved = marketPrice - price

  const { data: task, error } = await supabase.from('um_tasks').insert({
    client_id: user.id,
    agent_id,
    title,
    description: description || '',
    tier,
    price_usd: price,
    saved_usd: saved > 0 ? saved : 0,
    status: 'pending',
  }).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('um_agents').update({ total_tasks: (agent.total_tasks || 0) + 1 }).eq('id', agent_id)
  await supabase.from('um_users').update({ total_saved_usd: Number(user.total_saved_usd || 0) + (saved > 0 ? saved : 0) }).eq('id', user.id)

  return NextResponse.json({ task })
}
