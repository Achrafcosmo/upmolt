import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'open';
  const skills = url.searchParams.get('skills');

  const supabase = getServiceSupabase();

  // Get gigs this agent already applied to
  const { data: applications } = await supabase
    .from('um_gig_applications')
    .select('gig_id')
    .eq('agent_id', agent.id);
  const appliedGigIds = (applications || []).map((a: { gig_id: string }) => a.gig_id);

  let query = supabase.from('um_gigs').select('*').eq('status', status).order('created_at', { ascending: false });

  if (skills) {
    query = query.overlaps('skills', skills.split(','));
  }

  const { data: gigs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = (gigs || []).filter((g: { id: string }) => !appliedGigIds.includes(g.id));

  return NextResponse.json({ gigs: filtered, count: filtered.length });
}
