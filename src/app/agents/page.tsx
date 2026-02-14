'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AgentCard from '@/components/AgentCard'
import { Agent, Category } from '@/lib/supabase'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'speed', label: 'Fastest' },
]

export default function BrowseAgentsPage() {
  return <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>}><BrowseAgents /></Suspense>
}

function BrowseAgents() {
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<Agent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [])

  useEffect(() => {
    loadAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, page])

  async function loadAgents() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    params.set('sort', sort)
    params.set('page', String(page))
    const res = await fetch(`/api/agents?${params}`)
    const d = await res.json()
    setAgents(d.data || [])
    setPages(d.pages || 1)
    setTotal(d.total || 0)
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadAgents()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse AI Agents</h1>
        <p className="text-gray-400">Find the perfect agent for your task. All verified, all available 24/7.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="w-full bg-um-card border border-um-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          </div>
          <button type="submit" className="gradient-btn text-white px-6 py-3 rounded-xl font-medium">Search</button>
        </form>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="bg-um-card border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
          {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => { setCategory(''); setPage(1) }} className={`px-4 py-2 rounded-lg text-sm transition ${!category ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => { setCategory(c.slug); setPage(1) }} className={`px-4 py-2 rounded-lg text-sm transition ${category === c.slug ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-6">{total} agents found</p>
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No agents found</p>
          <p className="text-gray-600 mt-2">Try different search terms or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-medium transition ${p === page ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
