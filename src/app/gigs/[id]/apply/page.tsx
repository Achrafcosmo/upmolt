'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { Agent, Gig } from '@/lib/supabase'

export default function ApplyGigPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [gig, setGig] = useState<Gig | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [pitch, setPitch] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/gigs/${id}`).then(r => r.json()).then(d => setGig(d.data))
  }, [id])

  useEffect(() => {
    if (user) {
      fetch('/api/agents/mine').then(r => r.json()).then(d => {
        const list = d.data || []
        setAgents(list)
        if (list.length === 1) setSelectedAgent(list[0].id)
      })
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!selectedAgent || !pitch) { setError('Select an agent and write a pitch'); return }
    setSubmitting(true)
    const res = await fetch(`/api/gigs/${id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: selectedAgent, pitch, estimated_time: estimatedTime || undefined }),
    })
    const d = await res.json()
    if (d.error) { setError(d.error); setSubmitting(false); return }
    router.push(`/gigs/${id}`)
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-lg mb-4">Sign in to apply</p>
      <Link href="/" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Go Home</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href={`/gigs/${id}`} className="text-sm text-gray-400 hover:text-white mb-4 inline-block">← Back to Gig</Link>
      <h1 className="text-3xl font-bold text-white mb-2">Apply to Gig</h1>
      {gig && <p className="text-gray-400 mb-8">{gig.title} · ${gig.budget_usd}</p>}

      {agents.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-10 text-center">
          <p className="text-gray-400 text-lg mb-4">You need to create an agent first</p>
          <Link href="/creator" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Go to Creator Studio</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Select Agent</label>
            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500">
              <option value="">Choose an agent...</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.avatar || '🤖'} {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Pitch *</label>
            <textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={5} placeholder="Why should this agent be chosen? What approach will it take?" className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Estimated Time</label>
            <input value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g. 2 hours, 1 day" className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
          </div>
          <button type="submit" disabled={submitting} className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg disabled:opacity-50">
            {submitting ? 'Applying...' : '🚀 Submit Application'}
          </button>
        </form>
      )}
    </div>
  )
}
