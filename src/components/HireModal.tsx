'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Agent } from '@/lib/supabase'

const TIERS = [
  { key: 'basic', label: 'Basic', mult: 1, features: ['Standard delivery', '1 revision', 'Basic support'] },
  { key: 'standard', label: 'Standard', mult: 2, features: ['Priority delivery', '3 revisions', 'Priority support', 'Source files'], popular: true },
  { key: 'premium', label: 'Premium', mult: 3.5, features: ['Instant delivery', 'Unlimited revisions', '24/7 support', 'Source files', 'Commercial license'] },
]

export default function HireModal({ open, onClose, agent }: { open: boolean; onClose: () => void; agent: Agent }) {
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState('standard')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [savedAmount, setSavedAmount] = useState(0)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!open) return null

  const selected = TIERS.find(t => t.key === tier)!
  const price = Math.round(agent.price_usd * selected.mult)
  const marketPrice = Math.round(agent.market_rate_usd * selected.mult)
  const saved = marketPrice - price

  async function handleSubmit() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agent.id, title, description: desc, tier }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setSavedAmount(saved)
      setSuccess(true)
      setLoading(false)
      setTimeout(() => { router.push(`/dashboard/tasks/${data.task.id}`) }, 2500)
    } catch { setError('Something went wrong'); setLoading(false) }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-um-card border border-um-border rounded-2xl w-full max-w-md mx-4 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Task Created!</h2>
          <p className="text-lg text-emerald-400 font-bold mb-2">You just saved ${savedAmount.toLocaleString()}!</p>
          <p className="text-gray-400 text-sm">Redirecting to your task...</p>
          <div className="mt-4 w-full h-1 bg-um-border rounded-full overflow-hidden"><div className="h-full gradient-btn animate-pulse" style={{ width: '100%' }} /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-um-card border border-um-border rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-xl border border-um-border">{agent.avatar || '🤖'}</div>
          <div><h3 className="text-white font-bold">{agent.name}</h3><p className="text-xs text-gray-500">Hire this agent</p></div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'gradient-btn' : 'bg-um-border'}`} />)}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}

        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Select a Tier</h3>
            <div className="space-y-3">
              {TIERS.map(t => {
                const tp = Math.round(agent.price_usd * t.mult)
                const tm = Math.round(agent.market_rate_usd * t.mult)
                const ts = tm - tp
                return (
                  <button key={t.key} onClick={() => setTier(t.key)} className={`w-full text-left p-4 rounded-xl border transition ${tier === t.key ? 'border-um-purple bg-um-purple/5' : 'border-um-border hover:border-gray-600'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{t.label}</span>
                        {t.popular && <span className="ml-2 text-[10px] text-um-purple font-bold bg-um-purple/10 px-2 py-0.5 rounded-full">POPULAR</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">${tp}</span>
                        {ts > 0 && <span className="text-emerald-400 text-xs ml-2">Save ${ts}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {t.features.map(f => <span key={f} className="text-xs text-gray-500">{f}</span>)}
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setStep(2)} className="w-full gradient-btn text-white py-3 rounded-xl font-medium mt-4">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Describe Your Task</h3>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple mb-3" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what you need..." rows={4} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl text-sm">Back</button>
              <button onClick={() => { if (title.trim()) setStep(3) }} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Confirm Order</h3>
            <div className="bg-um-bg border border-um-border rounded-xl p-4 space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Agent</span><span className="text-white">{agent.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Tier</span><span className="text-white capitalize">{tier}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Task</span><span className="text-white truncate ml-4">{title}</span></div>
              <div className="border-t border-um-border pt-3 flex justify-between">
                <span className="text-gray-400">Price</span>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">${price}</span>
                  {saved > 0 && <span className="text-emerald-400 text-xs block">You save ${saved.toLocaleString()}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl text-sm">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Creating...' : 'Confirm & Hire'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
