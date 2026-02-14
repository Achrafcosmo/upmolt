'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { Subscription } from '@/lib/supabase'

interface Task {
  id: string; title: string; status: string; tier: string; price_usd: number; saved_usd: number; created_at: string; payment_status?: string;
  agent?: { name: string; slug: string; avatar: string; tagline: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch('/api/tasks/list').then(r => r.json()),
        fetch('/api/subscriptions/list').then(r => r.json()),
      ]).then(([t, s]) => {
        setTasks(t.data || [])
        setSubscriptions(s.data || [])
        setLoading(false)
      })
    }
  }, [user])

  async function cancelSub(id: string) {
    if (!confirm('Cancel this subscription?')) return
    setCancellingId(id)
    await fetch(`/api/subscriptions/${id}/cancel`, { method: 'POST' })
    setSubscriptions(prev => prev.filter(s => s.id !== id))
    setCancellingId(null)
  }

  if (authLoading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-lg mb-4">Sign in to view your dashboard</p>
      <Link href="/" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Go Home</Link>
    </div>
  )

  const totalSaved = tasks.reduce((s, t) => s + (t.saved_usd || 0), 0)
  const completed = tasks.filter(t => t.status === 'completed').length
  const active = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const monthlySpend = subscriptions.reduce((s, sub) => s + sub.price_usd, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back, {user.name}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-um-cyan mt-1">{active}</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5">
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completed}</p>
        </div>
        <div className="bg-um-card border border-um-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10" />
          <p className="text-sm text-gray-400 relative">💰 Total Saved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 relative">${totalSaved.toLocaleString()}</p>
        </div>
        {subscriptions.length > 0 && (
          <div className="bg-um-card border border-um-purple/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-um-purple/5 to-um-pink/5" />
            <p className="text-sm text-gray-400 relative">📦 Monthly</p>
            <p className="text-2xl font-bold text-um-purple mt-1 relative">${monthlySpend}</p>
          </div>
        )}
      </div>

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">Active Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-um-card border border-um-border rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-lg">
                      {sub.agent?.avatar || '🤖'}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{sub.agent?.name || 'Agent'}</h3>
                      <p className="text-xs text-gray-500 capitalize">{sub.tier} · ${sub.price_usd}/mo</p>
                    </div>
                  </div>
                  <span className="text-xs bg-um-purple/10 text-um-purple px-2.5 py-1 rounded-full font-medium capitalize">{sub.tier}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-um-bg rounded-full w-32">
                        <div className="h-2 bg-gradient-to-r from-um-purple to-um-pink rounded-full" style={{ width: `${(sub.tasks_used / sub.tasks_per_month) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{sub.tasks_used}/{sub.tasks_per_month} tasks</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Renews {new Date(sub.current_period_end).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => cancelSub(sub.id)} disabled={cancellingId === sub.id}
                    className="text-xs text-red-400 hover:text-red-300 transition">
                    {cancellingId === sub.id ? '...' : 'Cancel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tasks */}
      <h2 className="text-xl font-bold text-white mb-4">Your Tasks</h2>
      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-10 text-center">
          <p className="text-gray-400 text-lg mb-4">No tasks yet</p>
          <Link href="/agents" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Browse Agents</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="bg-um-card border border-um-border rounded-xl p-5 card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {t.agent && <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-lg flex-shrink-0">{t.agent.avatar || '🤖'}</div>}
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{t.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{t.agent?.name || 'Agent'} · <span className="capitalize">{t.tier}</span> · {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {t.saved_usd > 0 && <span className="text-xs text-emerald-400 font-medium">Saved ${t.saved_usd}</span>}
                  {t.payment_status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {t.payment_status}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[t.status] || 'bg-gray-500/10 text-gray-400'}`}>{t.status.replace('_', ' ')}</span>
                  <span className="text-white font-bold">${t.price_usd}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
