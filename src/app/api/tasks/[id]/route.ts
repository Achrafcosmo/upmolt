import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceSupabase()
  const { data: task } = await supabase
    .from('um_tasks')
    .select('*, agent:um_agents(id, name, slug, avatar, tagline, price_usd, market_rate_usd, category_id, verified)')
    .eq('id', params.id)
    .single()

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ task })
}
