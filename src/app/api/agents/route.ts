import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sb = getServiceSupabase()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'featured'
  const page = parseInt(searchParams.get('page') || '1')
  const includeSample = searchParams.get('include_sample') === 'true'
  const limit = 12
  const offset = (page - 1) * limit

  let query = sb.from('um_agents').select('*', { count: 'exact' }).eq('status', 'active')
  
  if (!includeSample) query = query.eq('is_sample', false)

  if (q) query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`)
  if (category) {
    const { data: cat } = await sb.from('um_categories').select('id').eq('slug', category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (sort === 'price_low') query = query.order('price_usd', { ascending: true })
  else if (sort === 'price_high') query = query.order('price_usd', { ascending: false })
  else if (sort === 'rating') query = query.order('avg_rating', { ascending: false })
  else if (sort === 'speed') query = query.order('avg_delivery_minutes', { ascending: true })
  else query = query.order('featured', { ascending: false }).order('avg_rating', { ascending: false })

  query = query.range(offset, offset + limit - 1)
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count, page, pages: Math.ceil((count || 0) / limit) })
}
