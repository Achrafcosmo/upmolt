'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'

interface UserRow { id: string; name: string; email: string; wallet: string; role: string; created_at: string; total_tasks: number; total_spent: number }
interface AgentRow { id: string; name: string; creator_id: string; category: { name: string } | null; avg_rating: number; status: string; featured: boolean; stat_tasks: number; stat_revenue: number }
interface TaskRow { id: string; title: string; status: string; price_usd: number; created_at: string; user: { name: string; email: string } | null; agent: { name: string } | null }
interface Stats { totalRevenue: number; totalUsers: number; totalAgents: number; totalTasks: number; tasksThisMonth: number; newUsersWeek: number }

const TABS = ['Users', 'Agents', 'Tasks', 'Revenue', 'Settings']

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState('Users')
  const [users, setUsers] = useState<UserRow[]>([])
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [taskFilter, setTaskFilter] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/'); return }
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setIsAdmin(true)
    })
  }, [user, authLoading, router])

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    if (tab === 'Users') fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false) })
    if (tab === 'Agents') fetch('/api/admin/agents').then(r => r.json()).then(d => { setAgents(d.agents || []); setLoading(false) })
    if (tab === 'Tasks') {
      const params = taskFilter ? `?status=${taskFilter}` : ''
      fetch(`/api/admin/tasks${params}`).then(r => r.json()).then(d => { setTasks(d.tasks || []); setLoading(false) })
    }
    if (tab === 'Revenue') fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
    if (tab === 'Settings') setLoading(false)
  }, [isAdmin, tab, taskFilter])

  async function agentAction(id: string, action: string) {
    await fetch(`/api/admin/agents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    setAgents(prev => {
      if (action === 'delete') return prev.filter(a => a.id !== id)
      return prev.map(a => {
        if (a.id !== id) return a
        if (action === 'approve') return { ...a, status: 'active' }
        if (action === 'reject') return { ...a, status: 'rejected' }
        if (action === 'feature') return { ...a, featured: true }
        if (action === 'unfeature') return { ...a, featured: false }
        return a
      })
    })
  }

  if (isAdmin === null) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">⚡ Admin Dashboard</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${tab === t ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {loading ? <p className="text-gray-500 text-center py-12">Loading...</p> : (
        <>
          {/* USERS */}
          {tab === 'Users' && (
            <div className="bg-um-card border border-um-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-um-border text-gray-500 text-left">
                    <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Tasks</th><th className="px-4 py-3">Spent</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-um-border/50 hover:bg-um-bg transition">
                        <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-um-purple/10 text-um-purple">{u.role}</span></td>
                        <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-white">{u.total_tasks}</td>
                        <td className="px-4 py-3 text-emerald-400">${u.total_spent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && <p className="text-center text-gray-500 py-8">No users yet</p>}
            </div>
          )}

          {/* AGENTS */}
          {tab === 'Agents' && (
            <div className="bg-um-card border border-um-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-um-border text-gray-500 text-left">
                    <th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tasks</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {agents.map(a => (
                      <tr key={a.id} className="border-b border-um-border/50 hover:bg-um-bg transition">
                        <td className="px-4 py-3 text-white font-medium">{a.name} {a.featured && <span className="text-yellow-400 text-xs">⭐</span>}</td>
                        <td className="px-4 py-3 text-gray-400">{a.category?.name || '—'}</td>
                        <td className="px-4 py-3 text-yellow-400">{'⭐'.repeat(Math.round(a.avg_rating || 0))}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{a.status}</span></td>
                        <td className="px-4 py-3 text-white">{a.stat_tasks}</td>
                        <td className="px-4 py-3 text-emerald-400">${a.stat_revenue.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {a.status !== 'active' && <button onClick={() => agentAction(a.id, 'approve')} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Approve</button>}
                            {a.status === 'active' && <button onClick={() => agentAction(a.id, 'reject')} className="text-[10px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">Reject</button>}
                            <button onClick={() => agentAction(a.id, a.featured ? 'unfeature' : 'feature')} className="text-[10px] px-2 py-1 rounded bg-um-purple/10 text-um-purple hover:bg-um-purple/20">{a.featured ? 'Unfeature' : 'Feature'}</button>
                            <button onClick={() => { if (confirm('Delete?')) agentAction(a.id, 'delete') }} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {agents.length === 0 && <p className="text-center text-gray-500 py-8">No agents yet</p>}
            </div>
          )}

          {/* TASKS */}
          {tab === 'Tasks' && (
            <div>
              <div className="flex gap-2 mb-4">
                {['', 'pending', 'in_progress', 'completed'].map(s => (
                  <button key={s} onClick={() => setTaskFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg transition ${taskFilter === s ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400'}`}>{s || 'All'}</button>
                ))}
              </div>
              <div className="bg-um-card border border-um-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-um-border text-gray-500 text-left">
                      <th className="px-4 py-3">Title</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Date</th>
                    </tr></thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t.id} className="border-b border-um-border/50 hover:bg-um-bg transition">
                          <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{t.title}</td>
                          <td className="px-4 py-3 text-gray-400">{t.user?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-400">{t.agent?.name || '—'}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-um-purple/10 text-um-purple'}`}>{t.status}</span></td>
                          <td className="px-4 py-3 text-white">${Number(t.price_usd).toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks found</p>}
              </div>
            </div>
          )}

          {/* REVENUE */}
          {tab === 'Revenue' && stats && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'from-um-purple to-um-pink' },
                  { label: 'Tasks This Month', value: stats.tasksThisMonth.toString(), color: 'from-cyan-500 to-blue-500' },
                  { label: 'New Users (7d)', value: stats.newUsersWeek.toString(), color: 'from-emerald-500 to-teal-500' },
                  { label: 'Total Agents', value: stats.totalAgents.toString(), color: 'from-orange-500 to-pink-500' },
                ].map(c => (
                  <div key={c.label} className="bg-um-card border border-um-border rounded-2xl p-6">
                    <p className="text-sm text-gray-500 mb-1">{c.label}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{c.value}</p>
                  </div>
                ))}
              </div>
              {/* Simple bar chart */}
              <div className="bg-um-card border border-um-border rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Overview</h3>
                <div className="flex items-end gap-4 h-40">
                  {[
                    { label: 'Users', val: stats.totalUsers, max: Math.max(stats.totalUsers, stats.totalAgents, stats.totalTasks, 1) },
                    { label: 'Agents', val: stats.totalAgents, max: Math.max(stats.totalUsers, stats.totalAgents, stats.totalTasks, 1) },
                    { label: 'Tasks', val: stats.totalTasks, max: Math.max(stats.totalUsers, stats.totalAgents, stats.totalTasks, 1) },
                  ].map(b => (
                    <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-white font-bold">{b.val}</span>
                      <div className="w-full rounded-t-lg gradient-btn" style={{ height: `${Math.max(10, (b.val / b.max) * 100)}%` }} />
                      <span className="text-[10px] text-gray-500">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'Settings' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6 max-w-lg">
              <h3 className="text-white font-bold mb-6">Platform Settings</h3>
              {[
                { label: 'Commission Rate (%)', value: '10', type: 'number' },
                { label: 'Featured Agents Limit', value: '12', type: 'number' },
                { label: 'Max Free Tasks/Month', value: '1', type: 'number' },
              ].map(s => (
                <div key={s.label} className="mb-4">
                  <label className="text-sm text-gray-400 block mb-1">{s.label}</label>
                  <input type={s.type} defaultValue={s.value} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-um-purple" />
                </div>
              ))}
              <button className="gradient-btn text-white px-6 py-2 rounded-xl font-medium mt-2">Save Settings</button>
              <p className="text-xs text-gray-600 mt-3">Settings are stored as environment variables. Update requires redeployment.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
