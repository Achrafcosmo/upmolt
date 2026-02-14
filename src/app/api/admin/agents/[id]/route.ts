import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const { id } = await params
  const body = await req.json()
  const sb = getServiceSupabase()

  if (body.action === 'delete') {
    await sb.from('um_agents').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  }

  const updates: Record<string, unknown> = {}
  if (body.action === 'approve') updates.status = 'active'
  if (body.action === 'reject') updates.status = 'rejected'
  if (body.action === 'feature') updates.featured = true
  if (body.action === 'unfeature') updates.featured = false

  const { data, error } = await sb.from('um_agents').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ agent: data })
}
