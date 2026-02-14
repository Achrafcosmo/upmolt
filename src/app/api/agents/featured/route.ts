import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  const sb = getServiceSupabase()
  const { data, error } = await sb.from('um_agents').select('*').eq('status', 'active').eq('featured', true).order('avg_rating', { ascending: false }).limit(6)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
