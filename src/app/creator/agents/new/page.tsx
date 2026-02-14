'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { Category } from '@/lib/supabase'

const EMOJIS = ['🤖', '🧠', '⚡', '🎨', '📊', '🔧', '📹', '✍️', '🎵', '🛡️', '📱', '🌐']
const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
const OUTPUT_FORMATS = ['markdown', 'code', 'plain text', 'JSON']

export default function NewAgent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [price, setPrice] = useState('')
  const [avatar, setAvatar] = useState('🤖')
  const [portfolio, setPortfolio] = useState<{title: string; description: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI Config
  const [model, setModel] = useState('gpt-4o')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState('')
  const [outputFormat, setOutputFormat] = useState('markdown')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [user, authLoading, router])

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]); setSkillInput('')
    }
  }

  function addPortfolio() { setPortfolio([...portfolio, { title: '', description: '' }]) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/creator/agents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, tagline, description, category_id: categoryId, skills,
        price_usd: Number(price), avatar,
        portfolio: portfolio.filter(p => p.title),
        model, api_key: apiKey || undefined, system_prompt: systemPrompt || undefined,
        knowledge_base: knowledgeBase || undefined, output_format: outputFormat,
        temperature, max_tokens: maxTokens,
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push('/creator')
  }

  if (authLoading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Create New Agent</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setAvatar(e)} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition ${avatar === e ? 'border-um-purple bg-um-purple/10' : 'border-um-border hover:border-gray-600'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" placeholder="e.g. CodeBot Pro" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Tagline *</label>
          <input value={tagline} onChange={e => setTagline(e.target.value)} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" placeholder="e.g. Full-stack development in minutes" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" placeholder="Describe what this agent does..." />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Category *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} className="flex-1 bg-um-bg border border-um-border rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-um-purple" placeholder="Add a skill" />
            <button type="button" onClick={addSkill} className="bg-um-border text-white px-4 py-2 rounded-xl text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="bg-um-bg border border-um-border text-gray-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                {s} <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="text-gray-500 hover:text-white">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Base Price (USD) *</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" placeholder="e.g. 50" />
        </div>

        {/* Portfolio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Portfolio</label>
            <button type="button" onClick={addPortfolio} className="text-xs text-um-purple hover:text-um-pink">+ Add item</button>
          </div>
          {portfolio.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={p.title} onChange={e => { const n = [...portfolio]; n[i].title = e.target.value; setPortfolio(n) }} placeholder="Title" className="flex-1 bg-um-bg border border-um-border rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-um-purple" />
              <input value={p.description} onChange={e => { const n = [...portfolio]; n[i].description = e.target.value; setPortfolio(n) }} placeholder="Description" className="flex-1 bg-um-bg border border-um-border rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-um-purple" />
              <button type="button" onClick={() => setPortfolio(portfolio.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400 px-2">×</button>
            </div>
          ))}
        </div>

        {/* AI Configuration */}
        <div className="border-t border-um-border pt-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">🤖 AI Configuration</h2>
          <p className="text-sm text-gray-500 mb-6">Configure the AI brain powering your agent. This makes it a real working agent, not just a listing.</p>

          <div className="space-y-5">
            {/* Model */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Your OpenAI or Anthropic API Key <span className="text-gray-600">(encrypted, never shared)</span></label>
              <div className="relative">
                <input
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  type={showApiKey ? 'text' : 'password'}
                  className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple"
                  placeholder="sk-... or sk-ant-..."
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition">
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none"
                placeholder="You are an expert web developer. When given a task, you write clean, production-ready code..."
              />
            </div>

            {/* Knowledge Base */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Knowledge Base <span className="text-gray-600">— Paste any reference docs, guidelines, or context your agent should know</span></label>
              <textarea
                value={knowledgeBase}
                onChange={e => setKnowledgeBase(e.target.value)}
                rows={6}
                className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none"
                placeholder="Paste documentation, style guides, code examples, or any text your agent needs as context..."
              />
            </div>

            {/* Output Format */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Output Format</label>
              <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
                {OUTPUT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Temperature: {temperature.toFixed(1)} <span className="text-gray-600">— Lower = more focused, Higher = more creative</span>
              </label>
              <input
                type="range" min="0" max="1" step="0.1"
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Precise (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Max Tokens</label>
              <input
                value={maxTokens}
                onChange={e => setMaxTokens(Number(e.target.value))}
                type="number" min="256" max="16384"
                className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full gradient-btn text-white py-3 rounded-xl font-medium text-lg disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  )
}
