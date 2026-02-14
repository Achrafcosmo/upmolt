import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const sb = getServiceSupabase()
  const { slug } = params
  const { data, error } = await sb.from('um_agents').select('*').eq('slug', slug).single()
  if (error || !data) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  
  // Get reviews
  const { data: reviews } = await sb.from('um_reviews').select('*').eq('agent_id', data.id).order('created_at', { ascending: false }).limit(10)
  
  // Get category
  const { data: category } = await sb.from('um_categories').select('*').eq('id', data.category_id).single()
  
  return NextResponse.json({ data: { ...data, reviews: reviews || [], category } })
}
