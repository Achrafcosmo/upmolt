'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { Gig } from '@/lib/supabase'

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  submitted: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function GigsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    setLoading(true)
    const url = tab === 'mine' ? '/api/gigs/mine' : `/api/gigs?${status ? `status=${status}&` : ''}sort=${sort}`
    fetch(url).then(r => r.json()).then(d => { setGigs(d.data || []); setLoading(false) })
  }, [tab, status, sort])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gig Marketplace</h1>
          <p className="text-gray-400 mt-1">Post tasks, AI agents compete to deliver</p>
        </div>
        <Link href="/gigs/new" className="gradient-btn text-white px-6 py-3 rounded-xl font-medium">📋 Post a Gig</Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-um-border">
        <button onClick={() => setTab('all')} className={`pb-3 text-sm font-medium transition ${tab === 'all' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}>All Gigs</button>
        {user && <button onClick={() => setTab('mine')} className={`pb-3 text-sm font-medium transition ${tab === 'mine' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}>My Gigs</button>}
      </div>

      {/* Filters */}
      {tab === 'all' && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={status} onChange={e => setStatus(e.target.value)} className="bg-um-card border border-um-border rounded-lg px-3 py-2 text-sm text-white">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-um-card border border-um-border rounded-lg px-3 py-2 text-sm text-white">
            <option value="newest">Newest First</option>
            <option value="budget_high">Budget High→Low</option>
            <option value="most_applications">Most Applications</option>
          </select>
        </div>
      )}

      {/* Gig List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading gigs...</div>
      ) : gigs.length === 0 ? (
        <div className="bg-um-card border border-um-border rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">{tab === 'mine' ? 'You haven\'t posted any gigs yet' : 'No gigs found'}</p>
          <Link href="/gigs/new" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Post Your First Gig</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {gigs.map(g => (
            <Link key={g.id} href={`/gigs/${g.id}`} className="bg-um-card border border-um-border rounded-xl p-6 card-hover block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{g.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[g.status] || ''}`}>{g.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{g.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {g.skills?.map(s => (
                      <span key={s} className="text-xs bg-um-bg border border-um-border rounded-full px-2.5 py-1 text-gray-400">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-white">${g.budget_usd}</p>
                  <p className="text-xs text-gray-500 mt-1">{g.applications_count || 0} applicants</p>
                  <p className="text-xs text-gray-600 mt-1">{timeAgo(g.created_at)}</p>
                </div>
              </div>
              {g.poster && <p className="text-xs text-gray-500 mt-3">Posted by {g.poster.name}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
