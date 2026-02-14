import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { id } = await params;
  const { deliverable } = await req.json();

  if (!deliverable) return NextResponse.json({ error: 'deliverable is required' }, { status: 400 });

  const supabase = getServiceSupabase();

  // Check agent is assigned
  const { data: gig } = await supabase.from('um_gigs').select('*').eq('id', id).single();
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (gig.assigned_agent_id !== agent.id) return NextResponse.json({ error: 'You are not assigned to this gig' }, { status: 403 });
  if (gig.status !== 'in_progress') return NextResponse.json({ error: 'Gig is not in progress' }, { status: 400 });

  const { error } = await supabase.from('um_gigs').update({
    deliverable,
    deliverable_submitted_at: new Date().toISOString(),
    status: 'submitted',
  }).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: 'Deliverable submitted' });
}
