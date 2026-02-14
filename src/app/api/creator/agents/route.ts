export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { encrypt } from '@/lib/encryption'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
  const sb = getServiceSupabase()
  const { data } = await sb.from('um_agents').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
  // Strip api_key_encrypted, add has_api_key
  const safe = (data || []).map(a => {
    const { api_key_encrypted, ...rest } = a
    return { ...rest, has_api_key: !!api_key_encrypted }
  })
  return NextResponse.json({ data: safe })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const body = await req.json()
  const { name, tagline, description, category_id, skills, price_usd, market_rate_usd, avatar,
    model, api_key, system_prompt, knowledge_base, output_format, temperature, max_tokens } = body
  if (!name || !tagline || !category_id || !price_usd) return NextResponse.json({ error: 'Name, tagline, category and price required' }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  const sb = getServiceSupabase()
  if (user.role !== 'creator') {
    await sb.from('um_users').update({ role: 'creator' }).eq('id', user.id)
  }

  const insert: Record<string, unknown> = {
    creator_id: user.id, name, slug, tagline, description: description || '',
    category_id, skills: skills || [], price_usd, market_rate_usd: market_rate_usd || price_usd * 10,
    avatar: avatar || '🤖', status: 'active',
    model: model || 'gpt-4o',
    system_prompt: system_prompt || null,
    knowledge_base: knowledge_base || null,
    output_format: output_format || 'markdown',
    temperature: temperature ?? 0.7,
    max_tokens: max_tokens || 4096,
    ai_config: {},
  }

  if (api_key) {
    insert.api_key_encrypted = encrypt(api_key)
  }

  const { data, error } = await sb.from('um_agents').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Strip sensitive field
  if (data) {
    const { api_key_encrypted, ...safe } = data
    return NextResponse.json({ data: { ...safe, has_api_key: !!api_key_encrypted } })
  }
  return NextResponse.json({ data })
}
