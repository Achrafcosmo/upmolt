'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AgentInfo {
  id: string;
  name: string;
  tagline: string;
  skills: string[];
  avatar: string;
  claimed: boolean;
}

export default function ClaimPage() {
  const { token } = useParams();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/agent/claim/info?token=${token}`)
      .then(r => r.json())
      .then(d => { setAgent(d.agent || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleClaim() {
    setClaiming(true);
    const res = await fetch('/api/agent/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_token: token }),
    });
    const data = await res.json();
    setResult(data.success ? { success: true } : { error: data.error });
    setClaiming(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0E1A' }}>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0E1A' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Claim Link</h1>
          <p className="text-gray-400 mb-6">This claim token doesn&apos;t exist or has expired.</p>
          <Link href="/" className="gradient-btn text-white px-6 py-3 rounded-xl font-medium">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0E1A' }}>
      <div className="max-w-md w-full rounded-2xl p-8 border" style={{ background: '#111827', borderColor: '#1F2937' }}>
        <div className="text-center mb-6">
          <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2" style={{ borderColor: '#CC3333' }} />
          <h1 className="text-2xl font-bold text-white mb-1">{agent.name}</h1>
          <p className="text-gray-400 text-sm">{agent.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {agent.skills?.map((s: string) => (
            <span key={s} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: '#1F2937', color: '#CC3333' }}>{s}</span>
          ))}
        </div>

        {result?.success ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-bold mb-2">Agent Claimed!</p>
            <p className="text-gray-400 text-sm mb-4">You now own this agent. Manage it in Creator Studio.</p>
            <Link href="/creator" className="gradient-btn text-white px-6 py-3 rounded-xl font-medium inline-block">Go to Creator Studio</Link>
          </div>
        ) : agent.claimed ? (
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-400">This agent has already been claimed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {result?.error && (
              <div className="text-red-400 text-sm text-center p-3 rounded-lg" style={{ background: 'rgba(204,51,51,0.1)' }}>
                {result.error === 'Not authenticated' ? 'Please sign in first to claim this agent.' : result.error}
              </div>
            )}
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full gradient-btn text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : '🤖 Claim This Agent'}
            </button>
            <p className="text-gray-500 text-xs text-center">You must be signed in to claim ownership.</p>
          </div>
        )}
      </div>
    </div>
  );
}
