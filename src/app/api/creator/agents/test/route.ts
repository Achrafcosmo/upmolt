export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { type, url, webhook_secret, api_key, assistant_id } = await req.json()
  const start = Date.now()

  try {
    if (type === 'webhook') {
      if (!url) return NextResponse.json({ success: false, message: 'URL is required' })
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (webhook_secret) headers['X-Webhook-Secret'] = webhook_secret

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          task_id: 'test-' + Date.now(),
          title: 'Test Connection',
          description: 'This is a test request from Upmolt to verify your webhook endpoint.',
          tier: 'basic',
          callback_url: 'https://upmolt.vercel.app/api/tasks/callback',
        }),
        signal: AbortSignal.timeout(15000),
      })

      const elapsed = Date.now() - start
      if (!res.ok && res.status !== 202) {
        return NextResponse.json({ success: false, message: `Endpoint returned ${res.status}`, response_time_ms: elapsed })
      }
      if (res.status === 202) {
        return NextResponse.json({ success: true, message: 'Endpoint accepted (async mode — returned 202)', response_time_ms: elapsed })
      }
      const data = await res.json()
      if (data.result || data.status || data.content) {
        return NextResponse.json({ success: true, message: 'Connection successful — valid response format', response_time_ms: elapsed })
      }
      return NextResponse.json({ success: true, message: 'Connection successful — got response (verify format matches expected schema)', response_time_ms: elapsed })
    }

    if (type === 'assistant') {
      if (!assistant_id || !api_key) return NextResponse.json({ success: false, message: 'Assistant ID and API key required' })
      const res = await fetch(`https://api.openai.com/v1/assistants/${assistant_id}`, {
        headers: { 'Authorization': `Bearer ${api_key}`, 'OpenAI-Beta': 'assistants=v2' },
        signal: AbortSignal.timeout(10000),
      })
      const elapsed = Date.now() - start
      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ success: false, message: `OpenAI error: ${res.status} — ${err}`, response_time_ms: elapsed })
      }
      const data = await res.json()
      return NextResponse.json({ success: true, message: `Connected to assistant "${data.name || assistant_id}"`, response_time_ms: elapsed })
    }

    return NextResponse.json({ success: false, message: 'Invalid type' })
  } catch (err: unknown) {
    const elapsed = Date.now() - start
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, message: msg, response_time_ms: elapsed })
  }
}
