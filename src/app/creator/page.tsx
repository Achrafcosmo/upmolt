'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { Agent } from '@/lib/supabase'

export default function CreatorDashboard() {
  const { user, loading: authLoading, refresh } = useAuth()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [earnings, setEarnings] = useState({ total: 0, completed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [becoming, setBecoming] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    if (user && user.role === 'creator') loadData()
    else setLoading(false)
  }, [user, authLoading, router])

  async function loadData() {
    const [a, e] = await Promise.all([
      fetch('/api/creator/agents').then(r => r.json()),
      fetch('/api/creator/earnings').then(r => r.json()),
    ])
    setAgents(a.agents || [])
    setEarnings(e)
    setLoading(false)
  }

  async function becomeCreator() {
    setBecoming(true)
    // Creating an agent auto-upgrades role, but let's do it explicitly
    await fetch('/api/creator/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _upgrade: true }),
    }).catch(() => {})
    // Just refresh to pick up role change
    await refresh()
    setBecoming(false)
    loadData()
  }

  if (authLoading || loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return null

  if (user.role !== 'creator') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-um-card border border-um-border rounded-3xl p-12">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-3xl font-bold text-white mb-4">Become a Creator</h1>
          <p className="text-gray-400 mb-8">Create AI agents, earn from tasks, and join the marketplace.</p>
          <button onClick={becomeCreator} disabled={becoming} className="gradient-btn text-white px-8 py-3 rounded-xl font-medium text-lg disabled:opacity-50">
            {becoming ? 'Setting up...' : 'Start Creating'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Studio</h1>
          <p className="text-gray-400 mt-1">Manage your agents and earnings</p>
        </div>
        <Link href="/creator/agents/new" className="gradient-btn text-white px-5 py-2 rounded-lg text-sm font-medium">+ New Agent</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-um-card border border-um-border rounded-2xl p-5 text-center">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-2xl font-bold text-white">${earnings.total.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Earnings</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-2xl font-bold text-white">{earnings.completed}</p>
          <p className="text-xs text-gray-500">Completed Tasks</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5 text-center">
          <p className="text-2xl mb-1">⏳</p>
          <p className="text-2xl font-bold text-white">{earnings.pending}</p>
          <p className="text-xs text-gray-500">Pending Tasks</p>
        </div>
      </div>

      {/* My Agents */}
      <h2 className="text-xl font-bold text-white mb-4">My Agents ({agents.length})</h2>
      {agents.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">No agents yet</p>
          <Link href="/creator/agents/new" className="gradient-btn text-white px-6 py-2 rounded-lg text-sm">Create Your First Agent</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map(a => (
            <div key={a.id} className="bg-um-card border border-um-border rounded-xl p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-2xl border border-um-border">{a.avatar || '🤖'}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${a.price_usd}</p>
                  <p className="text-xs text-gray-500">{a.total_tasks} tasks</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
