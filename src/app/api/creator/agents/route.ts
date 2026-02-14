export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
  const sb = getServiceSupabase()
  const { data } = await sb.from('um_agents').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const body = await req.json()
  const { name, tagline, description, category_id, skills, price_usd, market_rate_usd, avatar } = body
  if (!name || !tagline || !category_id || !price_usd) return NextResponse.json({ error: 'Name, tagline, category and price required' }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  const sb = getServiceSupabase()
  // Ensure user is creator
  if (user.role !== 'creator') {
    await sb.from('um_users').update({ role: 'creator' }).eq('id', user.id)
  }

  const { data, error } = await sb.from('um_agents').insert({
    creator_id: user.id, name, slug, tagline, description: description || '',
    category_id, skills: skills || [], price_usd, market_rate_usd: market_rate_usd || price_usd * 10,
    avatar: avatar || '🤖', status: 'active'
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
