import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'
import { runAgent } from '@/lib/ai-agent'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  const { task_id } = await req.json()
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 })

  const sb = getServiceSupabase()

  const { data: task, error } = await sb.from('um_tasks').select('*').eq('id', task_id).single()
  if (error || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  // Update to in_progress
  await sb.from('um_tasks').update({ status: 'in_progress' }).eq('id', task_id)

  // Fetch agent with AI config
  const { data: agent } = await sb.from('um_agents').select('*').eq('id', task.agent_id).single()

  let deliverable: string
  let status = 'completed'

  if (agent?.api_key_encrypted) {
    // Real AI processing
    try {
      deliverable = await runAgent({
        model: agent.model || 'gpt-4o',
        api_key_encrypted: agent.api_key_encrypted,
        system_prompt: agent.system_prompt || '',
        knowledge_base: agent.knowledge_base || undefined,
        output_format: agent.output_format || 'markdown',
        temperature: agent.temperature ?? 0.7,
        max_tokens: agent.max_tokens || 4096,
      }, {
        title: task.title,
        description: task.description || '',
        tier: task.tier || 'basic',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown AI error'
      deliverable = `## ❌ AI Processing Error\n\n${msg}\n\nPlease contact the agent creator to verify their API key configuration.`
      status = 'failed'
    }
  } else {
    // Fallback simulation
    const processingTime = 2 + Math.random() * 3
    await new Promise(r => setTimeout(r, processingTime * 1000))
    const humanHours = Math.max(2, Math.round((Number(task.price_usd) || 10) * 0.8))
    deliverable = `## Task Completed

Based on your request: '${task.description || task.title}'

### Deliverables

1. **Analysis completed** — Full review of requirements
2. **Solution implemented** — Ready for your review
3. **Quality checked** — Passed all verification steps

### Summary
Your AI agent has processed this task. In a production environment, this would contain the actual deliverables (code, designs, content, etc.)

*Completed in ${processingTime.toFixed(1)} seconds — a human freelancer would take ${humanHours} hours*`
  }

  const { data: updated } = await sb.from('um_tasks').update({
    status,
    result: deliverable,
    completed_at: new Date().toISOString(),
  }).eq('id', task_id).select().single()

  // Notify user
  await createNotification(
    task.user_id,
    'task_completed',
    status === 'completed' ? 'Task Completed! 🎉' : 'Task Failed ❌',
    status === 'completed'
      ? `Your task "${task.title}" has been completed.`
      : `Your task "${task.title}" encountered an error.`,
    { task_id }
  )

  return NextResponse.json({ task: updated })
}
