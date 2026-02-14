import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ count: 0 })

  const sb = getServiceSupabase()
  const { count } = await sb.from('um_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return NextResponse.json({ count: count || 0 })
}
