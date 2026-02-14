'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { Agent, Category } from '@/lib/supabase'

export default function CreatorDashboard() {
  const { user, loading: authLoading, refresh } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', tagline: '', description: '', category_id: '', skills: '', price_usd: '', market_rate_usd: '', avatar: '🤖' })

  useEffect(() => {
    if (user) {
      fetch('/api/creator/agents').then(r => r.json()).then(d => { setAgents(d.data || []); setLoading(false) })
      fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
    }
  }, [user])

  async function createAgent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/creator/agents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), price_usd: parseFloat(form.price_usd), market_rate_usd: parseFloat(form.market_rate_usd) || parseFloat(form.price_usd) * 10 })
    })
    const d = await res.json()
    if (d.data) {
      setAgents([d.data, ...agents])
      setShowForm(false)
      setForm({ name: '', tagline: '', description: '', category_id: '', skills: '', price_usd: '', market_rate_usd: '', avatar: '🤖' })
      refresh()
    }
    setSaving(false)
  }

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
        <button onClick={() => setShowForm(true)} className="gradient-btn text-white px-5 py-2.5 rounded-xl font-medium">+ New Agent</button>
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

      {/* New Agent Form */}
      {showForm && (
        <div className="bg-um-card border border-um-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Create New Agent</h2>
          <form onSubmit={createAgent} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Agent Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CodeForge AI" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Avatar (emoji)</label>
                <input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tagline</label>
              <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Short description of what your agent does" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of capabilities..." rows={4} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Price (USD)</label>
                <input type="number" value={form.price_usd} onChange={e => setForm({ ...form, price_usd: e.target.value })} placeholder="49" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Market Rate (USD)</label>
                <input type="number" value={form.market_rate_usd} onChange={e => setForm({ ...form, market_rate_usd: e.target.value })} placeholder="Freelancer equivalent price" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Skills (comma separated)</label>
              <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="gradient-btn text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create Agent'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white px-6 py-3">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Agent List */}
      <h2 className="text-xl font-bold text-white mb-4">My Agents</h2>
      {loading ? <p className="text-gray-500">Loading...</p> : agents.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-10 text-center">
          <p className="text-gray-400 mb-4">You haven&apos;t created any agents yet</p>
          <button onClick={() => setShowForm(true)} className="gradient-btn text-white px-6 py-3 rounded-xl">Create Your First Agent</button>
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
