import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('um_gigs').select('*').eq('id', id).single();

  if (error || !data) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

  return NextResponse.json(data);
}
