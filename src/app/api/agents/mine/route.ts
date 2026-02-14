import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data } = await sb.from('um_agents').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })

  return NextResponse.json({ data: data || [] })
}
