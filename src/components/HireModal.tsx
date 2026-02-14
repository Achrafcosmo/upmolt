'use client'
import { useState, useEffect } from 'react'
import { Agent } from '@/lib/supabase'
import PaymentModal from './PaymentModal'

const TIERS = [
  { key: 'basic', label: 'Basic', mult: 1, features: ['Standard delivery', '1 revision'] },
  { key: 'standard', label: 'Standard', mult: 2, features: ['Priority delivery', '3 revisions', 'Source files'], popular: true },
  { key: 'premium', label: 'Premium', mult: 3.5, features: ['Instant delivery', 'Unlimited revisions', 'Source files', 'Commercial license'] },
]

export default function HireModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState('basic')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [savedAmount, setSavedAmount] = useState(0)
  const [error, setError] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [taskData, setTaskData] = useState<any>(null)
  const [useSub, setUseSub] = useState(false)
  const [subInfo, setSubInfo] = useState<{ hasSubscription: boolean; tasksRemaining: number; subscription?: any } | null>(null)

  useEffect(() => {
    fetch(`/api/subscriptions/check?agent_id=${agent.id}`).then(r => r.json()).then(d => {
      if (d.data) setSubInfo(d.data)
    }).catch(() => {})
  }, [agent.id])

  const mult = TIERS.find(t => t.key === tier)?.mult || 1
  const price = Math.round(agent.price_usd * mult)
  const marketPrice = Math.round(agent.market_rate_usd * mult)
  const saved = marketPrice - price

  async function submit() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/tasks/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agent.id, title, description: desc, tier })
    })
    const d = await res.json()
    if (d.error) { setError(d.error); setLoading(false); return }

    if (useSub && subInfo?.hasSubscription) {
      // Use subscription - mark as paid, increment tasks_used
      await fetch('/api/tasks/use-subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: d.data.id, subscription_id: subInfo.subscription.id })
      })
      setSavedAmount(saved)
      setSuccess(true)
      setLoading(false)
    } else {
      setTaskData(d.data)
      setSavedAmount(saved)
      setShowPayment(true)
      setLoading(false)
    }
  }

  if (showPayment && taskData) {
    return (
      <PaymentModal
        amountUsd={price}
        taskId={taskData.id}
        savedUsd={saved}
        onSuccess={() => { setShowPayment(false); setSuccess(true) }}
        onClose={() => { setShowPayment(false); setLoading(false) }}
      />
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Task Submitted!</h2>
          <p className="text-gray-400 mb-4">{agent.name} is working on it now</p>
          {useSub && <p className="text-um-cyan text-sm mb-2">✓ Used from your subscription</p>}
          {savedAmount > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <p className="text-emerald-400 font-bold text-lg">You just saved ${savedAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-400">compared to hiring a freelancer</p>
            </div>
          )}
          <div className="flex gap-3">
            <a href="/dashboard" className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium text-center">View Dashboard</a>
            <button onClick={onClose} className="flex-1 bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl">Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Hire {agent.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'gradient-btn text-white' : 'bg-um-bg border border-um-border text-gray-500'}`}>{s}</div>
              <span className={`text-xs ${step >= s ? 'text-white' : 'text-gray-600'}`}>{['Tier', 'Details', 'Confirm'][s - 1]}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {subInfo?.hasSubscription && subInfo.tasksRemaining > 0 && (
              <div className="bg-um-cyan/10 border border-um-cyan/20 rounded-xl p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-um-cyan font-semibold text-sm">Active Subscription</p>
                    <p className="text-gray-400 text-xs">{subInfo.tasksRemaining} tasks remaining this month</p>
                  </div>
                  <button onClick={() => { setUseSub(!useSub) }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${useSub ? 'bg-um-cyan text-black' : 'bg-um-bg border border-um-border text-gray-300'}`}>
                    {useSub ? '✓ Using Sub' : 'Use Sub'}
                  </button>
                </div>
              </div>
            )}
            {TIERS.map(t => (
              <button key={t.key} onClick={() => setTier(t.key)} className={`w-full text-left p-4 rounded-xl border transition ${tier === t.key ? 'border-um-purple bg-um-purple/5' : 'border-um-border hover:border-gray-600'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    {t.popular && <span className="text-xs text-um-purple font-bold">MOST POPULAR</span>}
                    <h3 className="text-white font-semibold">{t.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.features.join(' · ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{useSub ? <span className="text-um-cyan">Free</span> : `$${Math.round(agent.price_usd * t.mult)}`}</p>
                    {!useSub && <p className="text-xs text-emerald-400">Save ${Math.round(agent.market_rate_usd * t.mult - agent.price_usd * t.mult)}</p>}
                  </div>
                </div>
              </button>
            ))}
            <button onClick={() => setStep(2)} className="w-full gradient-btn text-white py-3 rounded-xl font-medium mt-4">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Task title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build a landing page for my startup" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Describe what you need</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Be specific about your requirements..." rows={5} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl">Back</button>
              <button onClick={() => { if (title.trim()) setStep(3); else setError('Title is required') }} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-um-bg rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Agent</span><span className="text-white">{agent.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Tier</span><span className="text-white capitalize">{tier}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Task</span><span className="text-white truncate ml-4">{title}</span></div>
              <hr className="border-um-border" />
              {useSub ? (
                <div className="flex justify-between text-sm"><span className="text-gray-400">Payment</span><span className="text-um-cyan font-bold">From Subscription ✓</span></div>
              ) : (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Price</span><span className="text-white font-bold text-lg">${price}</span></div>
                  {saved > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">You save</span><span className="text-emerald-400 font-bold">${saved.toLocaleString()} ({Math.round((saved / marketPrice) * 100)}%)</span></div>}
                </>
              )}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl">Back</button>
              <button onClick={submit} disabled={loading} className="flex-1 gradient-btn text-white py-3 rounded-xl font-medium disabled:opacity-50">
                {loading ? 'Processing...' : useSub ? 'Confirm & Use Subscription' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
