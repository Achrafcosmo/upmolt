import crypto from 'crypto';
import { getServiceSupabase } from './supabase';

export function generateApiKey(): string {
  return 'umolt_' + crypto.randomBytes(32).toString('hex');
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function verifyAgentApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const key = authHeader.slice(7);
  const hash = hashApiKey(key);
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('um_agents')
    .select('*')
    .eq('agent_api_key_hash', hash)
    .single();

  if (data) {
    await supabase.from('um_agents').update({ last_seen_at: new Date().toISOString() }).eq('id', data.id);
  }
  return data;
}
