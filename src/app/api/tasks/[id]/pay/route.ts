export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: task } = await sb.from('um_tasks').select('*').eq('id', id).single()
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.client_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  // Update payment status
  await sb.from('um_tasks').update({ payment_status: 'paid' }).eq('id', id)

  // Trigger processing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  fetch(`${baseUrl}/api/tasks/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: id }),
  }).catch(() => {})

  return NextResponse.json({ data: { success: true } })
}
