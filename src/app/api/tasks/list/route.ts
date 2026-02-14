import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: tasks } = await supabase
    .from('um_tasks')
    .select('*, agent:um_agents(id, name, slug, avatar, category_id)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ tasks: tasks || [] })
}
