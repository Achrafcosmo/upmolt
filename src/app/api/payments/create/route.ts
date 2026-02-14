export const dynamic = 'force-dynamic'
export const maxDuration = 30
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { usdToSOL, PLATFORM_WALLET, generatePaymentReference } from '@/lib/payment'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { task_id, subscription_id, amount_usd, payment_method } = await req.json()
  if (!amount_usd || amount_usd <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const amount_sol = payment_method === 'sol' ? await usdToSOL(amount_usd) : null
  const reference = generatePaymentReference()
  const sb = getServiceSupabase()

  const { data: payment, error } = await sb.from('um_payments').insert({
    user_id: user.id,
    task_id: task_id || null,
    subscription_id: subscription_id || null,
    amount_usd,
    amount_sol,
    payment_method: payment_method || 'sol',
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: {
      payment_id: payment.id,
      amount_usd,
      amount_sol,
      recipient: PLATFORM_WALLET,
      reference,
    }
  })
}
