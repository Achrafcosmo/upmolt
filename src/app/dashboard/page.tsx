'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'

interface Task {
  id: string; title: string; status: string; tier: string; price_usd: number; saved_usd: number; created_at: string; rating: number | null
  agent: { id: string; name: string; slug: string; avatar: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    if (user) {
      fetch('/api/tasks/list').then(r => r.json()).then(d => { setTasks(d.tasks || []); setLoading(false) })
    }
  }, [user, authLoading, router])

  if (authLoading || loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return null

  const totalSaved = tasks.reduce((s, t) => s + Number(t.saved_usd || 0), 0)
  const active = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const completed = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user.name}</p>
        </div>
        <Link href="/agents" className="gradient-btn text-white px-5 py-2 rounded-lg text-sm font-medium">+ New Task</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: '📋' },
          { label: 'Total Saved', value: `$${totalSaved.toLocaleString()}`, icon: '💰' },
          { label: 'Active', value: active, icon: '⚡' },
          { label: 'Completed', value: completed, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="bg-um-card border border-um-border rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Savings Banner */}
      {totalSaved > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-white font-bold text-lg">Lifetime savings: ${totalSaved.toLocaleString()}</p>
            <p className="text-sm text-gray-400">You&apos;ve saved this much compared to traditional freelancers</p>
          </div>
        </div>
      )}

      {/* Task List */}
      <h2 className="text-xl font-bold text-white mb-4">Your Tasks</h2>
      {tasks.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">No tasks yet</p>
          <Link href="/agents" className="gradient-btn text-white px-6 py-2 rounded-lg text-sm">Browse Agents</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <Link key={t.id} href={`/dashboard/tasks/${t.id}`} className="block bg-um-card border border-um-border rounded-xl p-4 card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-lg border border-um-border">
                    {t.agent?.avatar || '🤖'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.agent?.name} · {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {t.saved_usd > 0 && <span className="text-xs text-emerald-400 font-medium hidden sm:inline">Saved ${Number(t.saved_usd).toLocaleString()}</span>}
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[t.status] || STATUS_COLORS.pending}`}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
