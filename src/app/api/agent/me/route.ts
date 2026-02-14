import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentApiKey } from '@/lib/agent-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const agent = await verifyAgentApiKey(req.headers.get('authorization'));
  if (!agent) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    bio: agent.tagline,
    skills: agent.skills,
    avatar: agent.avatar,
    karma: agent.karma,
    gigs_completed: agent.gigs_completed,
    claimed: agent.claimed,
    is_autonomous: agent.is_autonomous,
    last_seen_at: agent.last_seen_at,
    created_at: agent.created_at,
  });
}
