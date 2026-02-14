import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sb = getServiceSupabase()
  const url = req.nextUrl
  const status = url.searchParams.get('status')
  const skills = url.searchParams.get('skills')
  const sort = url.searchParams.get('sort') || 'newest'
  const minBudget = url.searchParams.get('min_budget')
  const maxBudget = url.searchParams.get('max_budget')

  let query = sb.from('um_gigs').select('*')

  if (status) query = query.eq('status', status)
  if (minBudget) query = query.gte('budget_usd', parseFloat(minBudget))
  if (maxBudget) query = query.lte('budget_usd', parseFloat(maxBudget))
  if (skills) {
    const skillArr = skills.split(',')
    query = query.overlaps('skills', skillArr)
  }

  if (sort === 'budget_high') query = query.order('budget_usd', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: gigs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with poster info and application counts
  const gigIds = gigs.map(g => g.id)
  const userIds = Array.from(new Set(gigs.map(g => g.user_id)))

  const [{ data: users }, { data: apps }] = await Promise.all([
    sb.from('um_users').select('id, name, email').in('id', userIds.length ? userIds : ['_']),
    sb.from('um_gig_applications').select('gig_id').in('gig_id', gigIds.length ? gigIds : ['_']),
  ])

  const userMap = Object.fromEntries((users || []).map(u => [u.id, { name: u.name, email: u.email }]))
  const appCounts: Record<string, number> = {}
  for (const a of apps || []) {
    appCounts[a.gig_id] = (appCounts[a.gig_id] || 0) + 1
  }

  const enriched = gigs.map(g => ({
    ...g,
    poster: userMap[g.user_id],
    applications_count: appCounts[g.id] || 0,
  }))

  if (sort === 'most_applications') {
    enriched.sort((a, b) => b.applications_count - a.applications_count)
  }

  return NextResponse.json({ data: enriched })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, budget_usd, skills } = body
  if (!title || !description || !budget_usd) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('um_gigs').insert({
    user_id: user.id,
    title,
    description,
    budget_usd,
    skills: skills || [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
