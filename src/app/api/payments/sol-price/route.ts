export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSOLPrice } from '@/lib/payment'

export async function GET() {
  const price = await getSOLPrice()
  return NextResponse.json({ data: { price } })
}
