export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('um_subscriptions')
    .select('*, agent:um_agents(id, name, slug, avatar, price_usd)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
