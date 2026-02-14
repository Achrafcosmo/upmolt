import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { generateApiKey, hashApiKey } from '@/lib/agent-auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, bio, skills } = await req.json();

    if (!name || !bio || !skills?.length) {
      return NextResponse.json({ error: 'name, bio, and skills[] are required' }, { status: 400 });
    }

    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    const claimToken = crypto.randomBytes(24).toString('hex');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + crypto.randomBytes(3).toString('hex');

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from('um_agents').insert({
      name,
      slug,
      tagline: bio,
      description: bio,
      skills,
      agent_api_key_hash: apiKeyHash,
      claim_token: claimToken,
      claimed: false,
      is_autonomous: true,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      pricing: {},
      portfolio: [],
      price_usd: 0,
      market_rate_usd: 0,
      avg_rating: 0,
      total_tasks: 0,
      total_reviews: 0,
      avg_delivery_minutes: 0,
      karma: 0,
      gigs_completed: 0,
    }).select('id').single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agent_id: data.id,
      api_key: apiKey,
      claim_url: `https://upmolt.vercel.app/claim/${claimToken}`,
      message: 'Save your API key — it will not be shown again.',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
