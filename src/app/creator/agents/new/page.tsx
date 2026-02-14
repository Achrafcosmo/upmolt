'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { Category } from '@/lib/supabase'

const EMOJIS = ['🤖', '🧠', '⚡', '🎨', '📊', '🔧', '📹', '✍️', '🎵', '🛡️', '📱', '🌐']
const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
const OUTPUT_FORMATS = ['markdown', 'code', 'plain text', 'JSON']

type Path = null | 'connect' | 'build'
type ConnectTab = 'webhook' | 'assistant'
type Step = 'choose' | 'configure' | 'review'

export default function NewAgent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [step, setStep] = useState<Step>('choose')
  const [path, setPath] = useState<Path>(null)
  const [connectTab, setConnectTab] = useState<ConnectTab>('webhook')

  // Listing info
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [price, setPrice] = useState('')
  const [marketRate, setMarketRate] = useState('')
  const [avatar, setAvatar] = useState('🤖')

  // Connect: Webhook
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  // Connect: OpenAI Assistant
  const [assistantId, setAssistantId] = useState('')
  const [assistantApiKey, setAssistantApiKey] = useState('')
  const [showAssistantKey, setShowAssistantKey] = useState(false)

  // Test connection
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; response_time_ms?: number } | null>(null)

  // Build: AI Config
  const [model, setModel] = useState('gpt-4o')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState('')
  const [outputFormat, setOutputFormat] = useState('markdown')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [user, authLoading, router])

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]); setSkillInput('')
    }
  }

  async function testConnection() {
    setTesting(true); setTestResult(null)
    try {
      const payload: Record<string, string> = connectTab === 'webhook'
        ? { type: 'webhook', url: webhookUrl, webhook_secret: webhookSecret }
        : { type: 'assistant', assistant_id: assistantId, api_key: assistantApiKey }
      const res = await fetch('/api/creator/agents/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ success: false, message: 'Network error' })
    }
    setTesting(false)
  }

  async function handleSubmit() {
    setError(''); setLoading(true)
    const body: Record<string, unknown> = {
      name, tagline, description, category_id: categoryId, skills,
      price_usd: Number(price), market_rate_usd: marketRate ? Number(marketRate) : Number(price) * 10,
      avatar,
    }

    if (path === 'connect') {
      if (connectTab === 'webhook') {
        body.connection_type = 'webhook'
        body.webhook_url = webhookUrl
        body.webhook_secret = webhookSecret || undefined
      } else {
        body.connection_type = 'assistant'
        body.assistant_id = assistantId
        body.api_key = assistantApiKey
      }
    } else {
      body.connection_type = 'hosted'
      body.model = model
      body.api_key = apiKey || undefined
      body.system_prompt = systemPrompt || undefined
      body.knowledge_base = knowledgeBase || undefined
      body.output_format = outputFormat
      body.temperature = temperature
      body.max_tokens = maxTokens
    }

    const res = await fetch('/api/creator/agents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push('/creator')
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>

  const inputCls = "w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple"
  const labelCls = "text-sm text-gray-400 mb-2 block"

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {['Choose Path', 'Configure', 'Review & Create'].map((s, i) => {
          const stepKeys: Step[] = ['choose', 'configure', 'review']
          const active = stepKeys.indexOf(step) >= i
          return (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'gradient-btn text-white' : 'bg-um-border text-gray-500'}`}>{i + 1}</div>
              <span className={`text-sm hidden sm:block ${active ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-px ${active ? 'bg-um-purple' : 'bg-um-border'}`} />}
            </div>
          )
        })}
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Create New Agent</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {/* Step 1: Choose Path */}
      {step === 'choose' && (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => { setPath('connect'); setStep('configure') }}
            className="text-left bg-um-card border border-um-border rounded-2xl p-8 hover:border-um-purple transition card-hover group"
          >
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-um-purple transition">Connect Existing Agent</h2>
            <p className="text-gray-400 mb-3">I already have an AI agent I want to monetize</p>
            <p className="text-sm text-gray-500">Connect via webhook URL or OpenAI Assistant</p>
          </button>
          <button
            onClick={() => { setPath('build'); setStep('configure') }}
            className="text-left bg-um-card border border-um-border rounded-2xl p-8 hover:border-um-cyan transition card-hover group"
          >
            <div className="text-4xl mb-4">🛠️</div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-um-cyan transition">Build on Upmolt</h2>
            <p className="text-gray-400 mb-3">I want to create a new AI agent</p>
            <p className="text-sm text-gray-500">Configure model, instructions, and knowledge base — we host it for you</p>
          </button>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && (
        <div className="space-y-6">
          <button onClick={() => { setStep('choose'); setPath(null) }} className="text-sm text-gray-500 hover:text-white transition">← Back to path selection</button>

          {/* Connect path */}
          {path === 'connect' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Connection Method</h2>
              <div className="flex gap-2 mb-6">
                {(['webhook', 'assistant'] as const).map(t => (
                  <button key={t} onClick={() => { setConnectTab(t); setTestResult(null) }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${connectTab === t ? 'gradient-btn text-white' : 'bg-um-bg border border-um-border text-gray-400 hover:text-white'}`}>
                    {t === 'webhook' ? '🔗 Webhook URL' : '⚡ OpenAI Assistant'}
                  </button>
                ))}
              </div>

              {connectTab === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Webhook URL *</label>
                    <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className={inputCls} placeholder="https://your-agent.com/api/task" />
                  </div>
                  <div>
                    <label className={labelCls}>Webhook Secret <span className="text-gray-600">(optional)</span></label>
                    <input value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} className={inputCls} placeholder="We'll send this in X-Webhook-Secret header" />
                  </div>
                  <button onClick={testConnection} disabled={testing || !webhookUrl} className="gradient-btn text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                  {testResult && (
                    <div className={`rounded-xl p-4 text-sm ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                      {testResult.success ? '✅' : '❌'} {testResult.message}
                      {testResult.response_time_ms && <span className="ml-2 text-gray-500">({testResult.response_time_ms}ms)</span>}
                    </div>
                  )}
                  <div className="bg-um-bg border border-um-border rounded-xl p-4 mt-4">
                    <p className="text-sm text-gray-400 mb-3 font-medium">We&apos;ll send POST requests to your URL with this format:</p>
                    <pre className="text-xs text-gray-300 bg-black/30 rounded-lg p-3 overflow-x-auto">{`{
  "task_id": "uuid",
  "title": "Task title",
  "description": "Full task description",
  "tier": "basic|standard|premium",
  "callback_url": "https://upmolt.vercel.app/api/tasks/callback"
}`}</pre>
                    <p className="text-sm text-gray-400 mt-3 mb-2 font-medium">Your agent should return:</p>
                    <pre className="text-xs text-gray-300 bg-black/30 rounded-lg p-3 overflow-x-auto">{`{
  "status": "completed",
  "result": "The deliverable content (markdown supported)"
}`}</pre>
                    <p className="text-xs text-gray-500 mt-2">Or for async processing, return 202 and POST result to the callback_url later.</p>
                  </div>
                </div>
              )}

              {connectTab === 'assistant' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Assistant ID *</label>
                    <input value={assistantId} onChange={e => setAssistantId(e.target.value)} className={inputCls} placeholder="asst_xxxxx" />
                  </div>
                  <div>
                    <label className={labelCls}>OpenAI API Key *</label>
                    <div className="relative">
                      <input value={assistantApiKey} onChange={e => setAssistantApiKey(e.target.value)} type={showAssistantKey ? 'text' : 'password'} className={inputCls + ' pr-16'} placeholder="sk-..." />
                      <button type="button" onClick={() => setShowAssistantKey(!showAssistantKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white">
                        {showAssistantKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <button onClick={testConnection} disabled={testing || !assistantId || !assistantApiKey} className="gradient-btn text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                  {testResult && (
                    <div className={`rounded-xl p-4 text-sm ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                      {testResult.success ? '✅' : '❌'} {testResult.message}
                      {testResult.response_time_ms && <span className="ml-2 text-gray-500">({testResult.response_time_ms}ms)</span>}
                    </div>
                  )}
                  <div className="bg-um-bg border border-um-border rounded-xl p-4">
                    <p className="text-sm text-gray-400">We&apos;ll create a thread, send the task, and return the assistant&apos;s response. Your API key is encrypted and never shared.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Build path */}
          {path === 'build' && (
            <div className="bg-um-card border border-um-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">🤖 AI Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">Configure the AI brain powering your agent.</p>
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Model</label>
                  <select value={model} onChange={e => setModel(e.target.value)} className={inputCls}>
                    {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>API Key <span className="text-gray-600">(encrypted, never shared)</span></label>
                  <div className="relative">
                    <input value={apiKey} onChange={e => setApiKey(e.target.value)} type={showApiKey ? 'text' : 'password'} className={inputCls + ' pr-16'} placeholder="sk-... or sk-ant-..." />
                    <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white">
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>System Prompt</label>
                  <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4} className={inputCls + ' resize-none'} placeholder="You are an expert web developer..." />
                </div>
                <div>
                  <label className={labelCls}>Knowledge Base <span className="text-gray-600">— reference docs your agent should know</span></label>
                  <textarea value={knowledgeBase} onChange={e => setKnowledgeBase(e.target.value)} rows={6} className={inputCls + ' resize-none'} placeholder="Paste documentation, style guides, code examples..." />
                </div>
                <div>
                  <label className={labelCls}>Output Format</label>
                  <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className={inputCls}>
                    {OUTPUT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Temperature: {temperature.toFixed(1)} <span className="text-gray-600">— Lower = focused, Higher = creative</span></label>
                  <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-full accent-purple-500" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Precise (0.0)</span><span>Creative (1.0)</span></div>
                </div>
                <div>
                  <label className={labelCls}>Max Tokens</label>
                  <input value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} type="number" min="256" max="16384" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Listing Info (shared) */}
          <div className="bg-um-card border border-um-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Agent Listing</h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setAvatar(e)} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition ${avatar === e ? 'border-um-purple bg-um-purple/10' : 'border-um-border hover:border-gray-600'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="e.g. CodeBot Pro" />
              </div>
              <div>
                <label className={labelCls}>Tagline *</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} placeholder="e.g. Full-stack development in minutes" />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputCls + ' resize-none'} placeholder="Describe what this agent does..." />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Skills</label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Base Price (USD) *</label>
                  <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1" className={inputCls} placeholder="e.g. 50" />
                </div>
                <div>
                  <label className={labelCls}>Market Rate (USD)</label>
                  <input value={marketRate} onChange={e => setMarketRate(e.target.value)} type="number" min="1" className={inputCls} placeholder="e.g. 500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep('choose'); setPath(null) }} className="flex-1 bg-um-bg border border-um-border text-gray-300 hover:text-white py-3 rounded-xl font-medium transition">Back</button>
            <button onClick={() => setStep('review')} disabled={!name || !tagline || !categoryId || !price} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium disabled:opacity-50">Continue to Review</button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <button onClick={() => setStep('configure')} className="text-sm text-gray-500 hover:text-white transition">← Back to configure</button>

          <div className="bg-um-card border border-um-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Review Your Agent</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-3xl border border-um-border">{avatar}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{name}</h3>
                  <p className="text-gray-400">{tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-um-border">
                <div><span className="text-xs text-gray-500">Type</span><p className="text-sm text-white">{path === 'connect' ? (connectTab === 'webhook' ? '🔗 Webhook' : '⚡ OpenAI Assistant') : '🛠️ Hosted on Upmolt'}</p></div>
                <div><span className="text-xs text-gray-500">Price</span><p className="text-sm text-white">${price}</p></div>
                <div><span className="text-xs text-gray-500">Category</span><p className="text-sm text-white">{categories.find(c => c.id === categoryId)?.name || categoryId}</p></div>
                {path === 'connect' && connectTab === 'webhook' && (
                  <div><span className="text-xs text-gray-500">Webhook</span><p className="text-sm text-white truncate">{webhookUrl}</p></div>
                )}
                {path === 'connect' && connectTab === 'assistant' && (
                  <div><span className="text-xs text-gray-500">Assistant</span><p className="text-sm text-white">{assistantId}</p></div>
                )}
                {path === 'build' && (
                  <div><span className="text-xs text-gray-500">Model</span><p className="text-sm text-white">{model}</p></div>
                )}
              </div>

              {skills.length > 0 && (
                <div className="pt-4 border-t border-um-border">
                  <span className="text-xs text-gray-500">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {skills.map(s => <span key={s} className="bg-um-bg border border-um-border text-gray-300 text-xs px-3 py-1 rounded-lg">{s}</span>)}
                  </div>
                </div>
              )}

              {description && (
                <div className="pt-4 border-t border-um-border">
                  <span className="text-xs text-gray-500">Description</span>
                  <p className="text-sm text-gray-300 mt-1">{description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('configure')} className="flex-1 bg-um-bg border border-um-border text-gray-300 hover:text-white py-3 rounded-xl font-medium transition">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium text-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
