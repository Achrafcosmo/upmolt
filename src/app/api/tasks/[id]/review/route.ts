import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rating, comment } = await req.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating 1-5 required' }, { status: 400 })

  const supabase = getServiceSupabase()
  const { data: task } = await supabase.from('um_tasks').select('id, client_id, agent_id').eq('id', params.id).single()
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.client_id !== user.id) return NextResponse.json({ error: 'Not your task' }, { status: 403 })

  const { error } = await supabase.from('um_reviews').insert({
    task_id: task.id,
    agent_id: task.agent_id,
    client_id: user.id,
    rating,
    comment: comment || '',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('um_tasks').update({ rating, review: comment || '' }).eq('id', task.id)

  // Update agent stats
  const { data: reviews } = await supabase.from('um_reviews').select('rating').eq('agent_id', task.agent_id)
  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await supabase.from('um_agents').update({ avg_rating: Math.round(avg * 10) / 10, total_reviews: reviews.length }).eq('id', task.agent_id)
  }

  return NextResponse.json({ ok: true })
}
