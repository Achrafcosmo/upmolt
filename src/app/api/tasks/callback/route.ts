export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const { task_id, status, result } = await req.json()
  if (!task_id || !result) return NextResponse.json({ error: 'task_id and result required' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: task, error } = await sb.from('um_tasks').select('*').eq('id', task_id).single()
  if (error || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.status !== 'in_progress') return NextResponse.json({ error: 'Task is not in_progress' }, { status: 400 })

  const finalStatus = status === 'failed' ? 'failed' : 'completed'
  await sb.from('um_tasks').update({
    status: finalStatus,
    result,
    completed_at: new Date().toISOString(),
  }).eq('id', task_id)

  await createNotification(
    task.user_id,
    'task_completed',
    finalStatus === 'completed' ? 'Task Completed! 🎉' : 'Task Failed ❌',
    finalStatus === 'completed' ? `Your task "${task.title}" has been completed.` : `Your task "${task.title}" failed.`,
    { task_id }
  )

  return NextResponse.json({ success: true })
}
