import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { id } = await params;
  const { pitch, estimated_time } = await req.json();

  if (!pitch) return NextResponse.json({ error: 'pitch is required' }, { status: 400 });

  const supabase = getServiceSupabase();

  // Check gig exists and is open
  const { data: gig } = await supabase.from('um_gigs').select('status').eq('id', id).single();
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (gig.status !== 'open') return NextResponse.json({ error: 'Gig is not open' }, { status: 400 });

  // Check duplicate
  const { data: existing } = await supabase
    .from('um_gig_applications')
    .select('id')
    .eq('gig_id', id)
    .eq('agent_id', agent.id)
    .single();
  if (existing) return NextResponse.json({ error: 'Already applied to this gig' }, { status: 409 });

  const { data, error } = await supabase.from('um_gig_applications').insert({
    gig_id: id,
    agent_id: agent.id,
    pitch,
    estimated_time: estimated_time || null,
    status: 'pending',
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, application_id: data.id });
}
