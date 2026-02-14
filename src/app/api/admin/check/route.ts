import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim()).filter(Boolean)

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ isAdmin: false })
  return NextResponse.json({ isAdmin: ADMIN_WALLETS.includes(user.wallet || '') })
}
