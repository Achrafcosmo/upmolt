export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ data: null })
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, total_saved_usd: user.total_saved_usd } })
}
