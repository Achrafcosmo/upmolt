'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
const OUTPUT_FORMATS = ['markdown', 'code', 'plain text', 'JSON']

export default function EditAgent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [price, setPrice] = useState('')
  const [avatar, setAvatar] = useState('🤖')
  const [subBasicTasks, setSubBasicTasks] = useState('5')
  const [subStandardTasks, setSubStandardTasks] = useState('15')
  const [subPremiumTasks, setSubPremiumTasks] = useState('50')

  // AI Config
  const [model, setModel] = useState('gpt-4o')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [changeApiKey, setChangeApiKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState('')
  const [outputFormat, setOutputFormat] = useState('markdown')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    fetch(`/api/creator/agents/${id}`).then(r => r.json()).then(d => {
      if (d.error) { setError(d.error); setLoading(false); return }
      const a = d.agent
      setName(a.name || '')
      setTagline(a.tagline || '')
      setDescription(a.description || '')
      setSkills(a.skills || [])
      setPrice(String(a.price_usd || ''))
      setAvatar(a.avatar || '🤖')
      setModel(a.model || 'gpt-4o')
      setHasApiKey(a.has_api_key || false)
      setSystemPrompt(a.system_prompt || '')
      setKnowledgeBase(a.knowledge_base || '')
      setOutputFormat(a.output_format || 'markdown')
      setTemperature(a.temperature ?? 0.7)
      setMaxTokens(a.max_tokens || 4096)
      if (a.subscription_plans?.length) {
        const plans = a.subscription_plans
        const basic = plans.find((p: { tier: string }) => p.tier === 'basic')
        const standard = plans.find((p: { tier: string }) => p.tier === 'standard')
        const premium = plans.find((p: { tier: string }) => p.tier === 'premium')
        if (basic) setSubBasicTasks(String(basic.tasks_per_month))
        if (standard) setSubStandardTasks(String(standard.tasks_per_month))
        if (premium) setSubPremiumTasks(String(premium.tasks_per_month))
      }
      setLoading(false)
    })
  }, [id, user, authLoading, router])

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]); setSkillInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true); setSuccess(false)
    const body: Record<string, unknown> = {
      name, tagline, description, skills, price_usd: Number(price), avatar,
      model, system_prompt: systemPrompt, knowledge_base: knowledgeBase,
      output_format: outputFormat, temperature, max_tokens: maxTokens,
      subscription_plans: [
        { tier: 'basic', tasks_per_month: Number(subBasicTasks) || 5, discount_pct: 10 },
        { tier: 'standard', tasks_per_month: Number(subStandardTasks) || 15, discount_pct: 20 },
        { tier: 'premium', tasks_per_month: Number(subPremiumTasks) || 50, discount_pct: 35 },
      ],
    }
    if (changeApiKey && apiKey) body.api_key = apiKey
    const res = await fetch(`/api/creator/agents/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setSaving(false); setSuccess(true)
    if (data.agent?.has_api_key) setHasApiKey(true)
  }

  if (loading || authLoading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Agent</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">Agent updated successfully!</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Tagline *</label>
          <input value={tagline} onChange={e => setTagline(e.target.value)} required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" />
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
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
        </div>

        {/* Subscription Plans */}
        <div className="border-t border-um-border pt-6">
          <h2 className="text-xl font-bold text-white mb-1">📦 Subscription Plans</h2>
          <p className="text-sm text-gray-500 mb-4">Tasks per month for each tier. Discounts: Basic 10%, Standard 20%, Premium 35%</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">⚡ Basic tasks/mo</label>
              <input value={subBasicTasks} onChange={e => setSubBasicTasks(e.target.value)} type="number" min="1" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">🚀 Standard tasks/mo</label>
              <input value={subStandardTasks} onChange={e => setSubStandardTasks(e.target.value)} type="number" min="1" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">💎 Premium tasks/mo</label>
              <input value={subPremiumTasks} onChange={e => setSubPremiumTasks(e.target.value)} type="number" min="1" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="border-t border-um-border pt-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">🤖 AI Configuration</h2>
          <p className="text-sm text-gray-500 mb-6">Configure the AI brain powering your agent.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">API Key <span className="text-gray-600">(encrypted, never shared)</span></label>
              {hasApiKey && !changeApiKey ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-um-bg border border-um-border rounded-xl px-4 py-3 text-gray-500">••••••••••••••••</div>
                  <button type="button" onClick={() => setChangeApiKey(true)} className="text-sm text-um-purple hover:text-um-pink transition">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <input value={apiKey} onChange={e => setApiKey(e.target.value)} type={showApiKey ? 'text' : 'password'} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" placeholder="sk-... or sk-ant-..." />
                  <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition">
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">System Prompt</label>
              <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" placeholder="You are an expert..." />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Knowledge Base</label>
              <textarea value={knowledgeBase} onChange={e => setKnowledgeBase(e.target.value)} rows={6} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" placeholder="Paste documentation, style guides, code examples..." />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Output Format</label>
              <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-um-purple">
                {OUTPUT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Temperature: {temperature.toFixed(1)}</label>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Precise (0.0)</span><span>Creative (1.0)</span></div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Max Tokens</label>
              <input value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} type="number" min="256" max="16384" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/creator')} className="flex-1 bg-um-bg border border-um-border text-gray-300 hover:text-white py-3 rounded-xl font-medium transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
