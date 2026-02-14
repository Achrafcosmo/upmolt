'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { Agent } from '@/lib/supabase'

export default function CreatorDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetch('/api/creator/agents').then(r => r.json()).then(d => { setAgents(d.data || []); setLoading(false) })
    }
  }, [user])

  if (authLoading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-lg mb-4">Sign in to access Creator Studio</p>
      <Link href="/" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Go Home</Link>
    </div>
  )

  const totalEarnings = agents.reduce((s, a) => s + (a.total_tasks * a.price_usd), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">🚀 Creator Studio</h1>
          <p className="text-gray-400 mt-1">Create and manage your AI agents</p>
        </div>
        <Link href="/creator/agents/new" className="gradient-btn text-white px-5 py-2.5 rounded-xl font-medium inline-block">+ New Agent</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">My Agents</p>
          <p className="text-2xl font-bold text-white mt-1">{agents.length}</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-um-cyan mt-1">{agents.reduce((s, a) => s + a.total_tasks, 0)}</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">💰 Estimated Earnings</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Agent List */}
      <h2 className="text-xl font-bold text-white mb-4">My Agents</h2>
      {loading ? <p className="text-gray-500">Loading...</p> : agents.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-10 text-center">
          <p className="text-gray-400 mb-4">You haven&apos;t created any agents yet</p>
          <Link href="/creator/agents/new" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Create Your First Agent</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(a => (
            <div key={a.id} className="bg-um-card border border-um-border rounded-xl p-5 card-hover flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-2xl border border-um-border">{a.avatar || '🤖'}</div>
                <div>
                  <h3 className="text-white font-medium">{a.name}</h3>
                  <p className="text-sm text-gray-500">{a.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center"><p className="text-gray-500">Tasks</p><p className="text-white font-bold">{a.total_tasks}</p></div>
                <div className="text-center"><p className="text-gray-500">Rating</p><p className="text-yellow-400 font-bold">{a.avg_rating.toFixed(1)} ⭐</p></div>
                <div className="text-center"><p className="text-gray-500">Price</p><p className="text-white font-bold">${a.price_usd}</p></div>
                <Link href={`/agents/${a.slug}`} className="text-um-purple hover:text-um-pink transition text-sm">View →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
