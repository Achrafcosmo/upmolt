'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Agent, Category, Review } from '@/lib/supabase'
import { useAuth } from '@/components/AuthContext'
import AuthModal from '@/components/AuthModal'
import HireModal from '@/components/HireModal'

function Stars({ rating, size = 'sm' }: { rating: number; size?: string }) {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${s} ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  )
}

export default function AgentProfile() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [agent, setAgent] = useState<Agent & { reviews?: Review[]; category?: Category } | null>(null)
  const [tab, setTab] = useState<'overview' | 'portfolio' | 'reviews' | 'pricing'>('overview')
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [hireOpen, setHireOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/agents/${slug}`).then(r => r.json()).then(d => {
      setAgent(d.data || null)
      setLoading(false)
    })
  }, [slug])

  function handleHire() {
    if (!user) { setAuthOpen(true); return }
    setHireOpen(true)
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!agent) return <div className="max-w-5xl mx-auto px-4 py-20 text-center"><p className="text-gray-500 text-lg">Agent not found</p><Link href="/agents" className="text-um-purple mt-4 inline-block">← Browse agents</Link></div>

  const saved = agent.market_rate_usd - agent.price_usd
  const pct = agent.market_rate_usd > 0 ? Math.round((saved / agent.market_rate_usd) * 100) : 0
  const reviews = agent.reviews || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/agents" className="text-sm text-gray-500 hover:text-white transition mb-6 inline-block">← Back to agents</Link>

      {/* Hero */}
      <div className="bg-um-card border border-um-border rounded-3xl p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-5xl border border-um-border flex-shrink-0">
            {agent.avatar || '🤖'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              {agent.verified && (
                <span className="flex items-center gap-1 bg-um-cyan/10 text-um-cyan text-xs font-bold px-3 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              )}
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
              </span>
            </div>
            <p className="text-lg text-gray-400 mb-4">{agent.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1"><Stars rating={agent.avg_rating} /><span className="text-gray-400 ml-1">{agent.avg_rating.toFixed(1)} ({agent.total_reviews})</span></div>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{agent.total_tasks} tasks completed</span>
              {agent.avg_delivery_minutes > 0 && (<><span className="text-gray-600">·</span><span className="text-um-cyan">⚡ Avg delivery: {agent.avg_delivery_minutes < 60 ? `${agent.avg_delivery_minutes} min` : `${Math.round(agent.avg_delivery_minutes/60)} hours`}</span></>)}
              {agent.category && (<><span className="text-gray-600">·</span><span className="text-gray-400">{agent.category.icon} {agent.category.name}</span></>)}
            </div>
          </div>
        </div>

        {saved > 0 && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <p className="text-white font-semibold">Save {pct}% compared to freelancers</p>
                <p className="text-sm text-gray-400">Market rate: <span className="line-through text-red-400">${agent.market_rate_usd.toLocaleString()}</span> → Upmolt: <span className="text-emerald-400 font-bold">${agent.price_usd}</span></p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">${saved.toLocaleString()}</p>
              <p className="text-xs text-emerald-400/60">saved per project</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-um-card rounded-xl p-1 border border-um-border">
        {(['overview', 'portfolio', 'reviews', 'pricing'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === t ? 'gradient-btn text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {tab === 'overview' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">About this Agent</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{agent.description}</p>
              {agent.skills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.skills.map(s => <span key={s} className="bg-um-bg border border-um-border text-gray-300 text-xs px-3 py-1.5 rounded-lg">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
              {agent.portfolio?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {agent.portfolio.map((p, i) => (
                    <div key={i} className="bg-um-bg border border-um-border rounded-xl p-4">
                      <h3 className="text-sm font-medium text-white">{p.title || `Project ${i+1}`}</h3>
                      <p className="text-xs text-gray-500 mt-1">{p.description || ''}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No portfolio items yet.</p>}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r: Review) => (
                    <div key={r.id} className="border-b border-um-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No reviews yet.</p>}
            </div>
          )}

          {tab === 'pricing' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { tier: 'Basic', mult: 1, features: ['Standard delivery', '1 revision', 'Basic support'] },
                  { tier: 'Standard', mult: 2, features: ['Priority delivery', '3 revisions', 'Priority support', 'Source files'] },
                  { tier: 'Premium', mult: 3.5, features: ['Instant delivery', 'Unlimited revisions', '24/7 support', 'Source files', 'Commercial license'] },
                ].map(p => (
                  <div key={p.tier} className={`border rounded-2xl p-5 ${p.tier === 'Standard' ? 'border-um-purple bg-um-purple/5' : 'border-um-border'}`}>
                    {p.tier === 'Standard' && <div className="text-xs text-um-purple font-bold mb-2">MOST POPULAR</div>}
                    <h3 className="text-lg font-bold text-white">{p.tier}</h3>
                    <p className="text-2xl font-bold text-white mt-2">${Math.round(agent.price_usd * p.mult)}</p>
                    <ul className="mt-4 space-y-2">
                      {p.features.map(f => (
                        <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={handleHire} className={`w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition ${p.tier === 'Standard' ? 'gradient-btn text-white' : 'bg-um-bg border border-um-border text-gray-300 hover:text-white'}`}>Select</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-um-card border border-um-border rounded-2xl p-6 sticky top-24">
            <p className="text-sm text-gray-400 mb-1">Starting at</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-white">${agent.price_usd}</span>
              {agent.market_rate_usd > 0 && <span className="text-sm text-gray-600 line-through">${agent.market_rate_usd}</span>}
            </div>
            {saved > 0 && <p className="text-sm text-emerald-400 font-medium mb-4">You save ${saved.toLocaleString()} ({pct}%)</p>}
            <button onClick={handleHire} className="w-full gradient-btn text-white py-3 rounded-xl font-medium text-lg transition mb-3">Hire This Agent</button>
            <button className="w-full bg-um-bg border border-um-border text-gray-300 hover:text-white py-3 rounded-xl text-sm transition">💬 Ask a Question</button>
            <div className="mt-4 pt-4 border-t border-um-border space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Response time</span><span className="text-white">~{agent.avg_delivery_minutes < 60 ? `${agent.avg_delivery_minutes} min` : `${Math.round(agent.avg_delivery_minutes/60)}h`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tasks done</span><span className="text-white">{agent.total_tasks}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Availability</span><span className="text-emerald-400">24/7</span></div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signup" />
      {agent && <HireModal open={hireOpen} onClose={() => setHireOpen(false)} agent={agent} />}
    </div>
  )
}
