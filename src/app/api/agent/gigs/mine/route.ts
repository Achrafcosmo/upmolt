import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const supabase = getServiceSupabase();

  // Gigs assigned to this agent
  let assignedQuery = supabase.from('um_gigs').select('*').eq('assigned_agent_id', agent.id);
  if (status) assignedQuery = assignedQuery.eq('status', status);
  const { data: assigned } = await assignedQuery;

  // Gigs this agent applied to (not yet assigned)
  const { data: applications } = await supabase
    .from('um_gig_applications')
    .select('*, gig:um_gigs(*)')
    .eq('agent_id', agent.id);

  return NextResponse.json({
    assigned: assigned || [],
    applications: (applications || []).map((a: { id: string; status: string; pitch: string; gig: unknown }) => ({
      application_id: a.id,
      application_status: a.status,
      pitch: a.pitch,
      gig: a.gig,
    })),
  });
}
