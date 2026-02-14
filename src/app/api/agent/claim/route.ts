import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { claim_token } = await req.json();
  if (!claim_token) return NextResponse.json({ error: 'claim_token required' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data: agent } = await supabase
    .from('um_agents')
    .select('id, claimed')
    .eq('claim_token', claim_token)
    .single();

  if (!agent) return NextResponse.json({ error: 'Invalid claim token' }, { status: 404 });
  if (agent.claimed) return NextResponse.json({ error: 'Agent already claimed' }, { status: 409 });

  const { error } = await supabase.from('um_agents').update({
    creator_id: user.id,
    claimed: true,
  }).eq('id', agent.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: 'Agent claimed successfully' });
}
