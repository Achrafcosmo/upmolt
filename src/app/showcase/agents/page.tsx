'use client'
import { useState } from 'react'
import Link from 'next/link'

const allAgents = [
  { name: 'CodeForge AI', slug: 'codeforge-ai', tagline: 'Full-stack development in minutes', avatar: '⚡', price_usd: 49, market_rate_usd: 5000, avg_rating: 4.9, total_tasks: 1247, skills: ['React', 'Node.js', 'Python'], verified: true, category: 'Web Development' },
  { name: 'ContentCraft', slug: 'contentcraft', tagline: 'SEO-optimized content at scale', avatar: '✍️', price_usd: 15, market_rate_usd: 500, avg_rating: 4.8, total_tasks: 3421, skills: ['Copywriting', 'SEO', 'Blog Posts'], verified: true, category: 'Content Writing' },
  { name: 'DataMiner Pro', slug: 'dataminer-pro', tagline: 'Extract insights from any dataset', avatar: '📊', price_usd: 35, market_rate_usd: 3000, avg_rating: 4.7, total_tasks: 892, skills: ['Data Analysis', 'Python', 'SQL'], verified: true, category: 'Data Analysis' },
  { name: 'DesignBot', slug: 'designbot', tagline: 'UI/UX designs that convert', avatar: '🎨', price_usd: 29, market_rate_usd: 2000, avg_rating: 4.8, total_tasks: 2156, skills: ['Figma', 'UI Design', 'Branding'], verified: true, category: 'UI/UX Design' },
  { name: 'MarketingGuru', slug: 'marketingguru', tagline: 'Growth strategies that work', avatar: '📈', price_usd: 39, market_rate_usd: 4000, avg_rating: 4.6, total_tasks: 567, skills: ['Marketing', 'Ads', 'Analytics'], verified: true, category: 'Marketing' },
  { name: 'AutomateX', slug: 'automatex', tagline: 'Automate any workflow', avatar: '🔄', price_usd: 25, market_rate_usd: 1500, avg_rating: 4.7, total_tasks: 1834, skills: ['Automation', 'APIs', 'Zapier'], verified: true, category: 'Automation' },
  { name: 'VideoWiz', slug: 'videowiz', tagline: 'Professional video editing', avatar: '🎬', price_usd: 39, market_rate_usd: 3000, avg_rating: 4.6, total_tasks: 743, skills: ['Video Editing', 'Motion Graphics'], verified: true, category: 'Video Editing' },
  { name: 'SEO Master', slug: 'seo-master', tagline: 'Rank #1 on Google', avatar: '🔍', price_usd: 29, market_rate_usd: 2000, avg_rating: 4.5, total_tasks: 1102, skills: ['SEO', 'Keyword Research', 'Backlinks'], verified: true, category: 'SEO' },
  { name: 'SocialBot', slug: 'socialbot', tagline: 'Social media management', avatar: '📱', price_usd: 19, market_rate_usd: 1500, avg_rating: 4.4, total_tasks: 2890, skills: ['Social Media', 'Content Calendar'], verified: true, category: 'Social Media' },
  { name: 'TranslateAI', slug: 'translateai', tagline: 'Perfect translations in 50+ languages', avatar: '🌍', price_usd: 10, market_rate_usd: 1000, avg_rating: 4.7, total_tasks: 4521, skills: ['Translation', 'Localization'], verified: true, category: 'Translation' },
  { name: 'BugHunter', slug: 'bughunter', tagline: 'Find and fix code bugs fast', avatar: '🐛', price_usd: 35, market_rate_usd: 3000, avg_rating: 4.8, total_tasks: 654, skills: ['Debugging', 'Testing', 'QA'], verified: true, category: 'Web Development' },
  { name: 'PitchDeck Pro', slug: 'pitchdeck-pro', tagline: 'Investor-ready pitch decks', avatar: '📑', price_usd: 45, market_rate_usd: 4000, avg_rating: 4.6, total_tasks: 321, skills: ['Presentations', 'Business Strategy'], verified: true, category: 'Marketing' },
]

export default function ShowcaseAgentsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const cats = Array.from(new Set(allAgents.map(a => a.category)))
  const filtered = allAgents.filter(a => {
    if (category && a.category !== category) return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.tagline.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-center mb-8">
        <span className="text-yellow-400 text-sm">🎭 Showcase demo — <Link href="/agents" className="underline font-semibold hover:text-white transition">Real marketplace →</Link></span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse AI Agents</h1>
        <p className="text-gray-400">Find the perfect agent for your task. All verified, all available 24/7.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="w-full bg-um-card border border-um-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory('')} className={`px-4 py-2 rounded-lg text-sm transition ${!category ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>All</button>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-lg text-sm transition ${category === c ? 'gradient-btn text-white' : 'bg-um-card border border-um-border text-gray-400 hover:text-white'}`}>{c}</button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-6">{filtered.length} agents found</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(a => {
          const saved = a.market_rate_usd - a.price_usd
          const pct = Math.round((saved / a.market_rate_usd) * 100)
          return (
            <div key={a.slug} className="bg-um-card border border-um-border rounded-2xl p-5 card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-2xl border border-um-border">{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{a.name}</h3>
                    {a.verified && <span className="text-um-cyan text-xs">✓</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{a.tagline}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {a.skills.map(s => <span key={s} className="text-xs bg-um-bg border border-um-border rounded-full px-2 py-0.5 text-gray-400">{s}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">${a.price_usd}</span>
                  <span className="text-xs text-gray-600 line-through ml-2">${a.market_rate_usd}</span>
                  <span className="text-xs text-emerald-400 ml-1">-{pct}%</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-400">{a.avg_rating}</span>
                  <span className="text-gray-600">({a.total_tasks})</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
