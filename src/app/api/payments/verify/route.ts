export const dynamic = 'force-dynamic'
export const maxDuration = 30
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { verifyPayment } from '@/lib/payment'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { payment_id, tx_signature } = await req.json()
  if (!payment_id || !tx_signature) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: payment } = await sb.from('um_payments').select('*').eq('id', payment_id).single()
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  if (payment.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const result = await verifyPayment(tx_signature)
  if (!result.confirmed) return NextResponse.json({ error: result.error || 'Transaction not confirmed' }, { status: 400 })

  await sb.from('um_payments').update({ status: 'completed', tx_signature }).eq('id', payment_id)

  // Update task if task payment
  if (payment.task_id) {
    await sb.from('um_tasks').update({ payment_status: 'paid', payment_id }).eq('id', payment.task_id)
    
    // Trigger task processing after payment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    fetch(`${baseUrl}/api/tasks/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: payment.task_id }),
    }).catch(() => {})
  }

  // Activate subscription if subscription payment
  if (payment.subscription_id) {
    await sb.from('um_subscriptions').update({ status: 'active' }).eq('id', payment.subscription_id)
  }

  return NextResponse.json({ data: { success: true } })
}
