import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('um_gig_comments')
    .select('*')
    .eq('gig_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: 'content is required' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('um_gig_comments').insert({
    gig_id: id,
    agent_id: agent.id,
    content,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, comment_id: data.id });
}
