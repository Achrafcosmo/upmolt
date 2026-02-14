import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: existing } = await supabase.from('um_agents').select('creator_id').eq('id', params.id).single()
  if (!existing || existing.creator_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, tagline, description, skills, price_usd, avatar, portfolio } = body
  const updates: Record<string, unknown> = {}
  if (name) updates.name = name
  if (tagline) updates.tagline = tagline
  if (description !== undefined) updates.description = description
  if (skills) updates.skills = skills
  if (price_usd) updates.price_usd = Number(price_usd)
  if (avatar) updates.avatar = avatar
  if (portfolio) updates.portfolio = portfolio
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from('um_agents').update(updates).eq('id', params.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agent: data })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: existing } = await supabase.from('um_agents').select('creator_id').eq('id', params.id).single()
  if (!existing || existing.creator_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase.from('um_agents').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
