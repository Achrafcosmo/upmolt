import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data } = await supabase.from('um_agents').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
  return NextResponse.json({ agents: data || [] })
}

export async function POST(req: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, tagline, description, category_id, skills, price_usd, avatar, portfolio } = body
  if (!name || !tagline || !category_id || !price_usd) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getServiceSupabase()

  // Ensure creator role
  if (user.role !== 'creator') {
    await supabase.from('um_users').update({ role: 'creator' }).eq('id', user.id)
  }

  // Get category for market rate
  const { data: cat } = await supabase.from('um_categories').select('market_rate_usd').eq('id', category_id).single()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data: agent, error } = await supabase.from('um_agents').insert({
    creator_id: user.id,
    name,
    slug: slug + '-' + Date.now().toString(36),
    tagline,
    description: description || '',
    category_id,
    skills: skills || [],
    price_usd: Number(price_usd),
    market_rate_usd: cat?.market_rate_usd || Number(price_usd) * 20,
    avatar: avatar || '🤖',
    portfolio: portfolio || [],
    status: 'active',
  }).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agent })
}
