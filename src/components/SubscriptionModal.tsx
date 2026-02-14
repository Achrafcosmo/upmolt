'use client'
import { useState } from 'react'
import { Agent } from '@/lib/supabase'
import PaymentModal from './PaymentModal'

const TIERS = [
  { key: 'basic', label: 'Basic', tasks: 5, discount: 10, icon: '⚡' },
  { key: 'standard', label: 'Standard', tasks: 15, discount: 20, icon: '🚀', popular: true },
  { key: 'premium', label: 'Premium', tasks: 50, discount: 35, icon: '💎' },
]

export default function SubscriptionModal({ agent, onClose, onSuccess }: { agent: Agent; onClose: () => void; onSuccess?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [subData, setSubData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getPrice(tier: typeof TIERS[0]) {
    return Math.round(agent.price_usd * tier.tasks * (1 - tier.discount / 100))
  }

  function getPricePerTask(tier: typeof TIERS[0]) {
    return (getPrice(tier) / tier.tasks).toFixed(2)
  }

  async function subscribe() {
    if (!selected) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/subscriptions/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agent.id, tier: selected, plan: 'monthly' })
    })
    const d = await res.json()
    if (d.error) { setError(d.error); setLoading(false); return }
    setSubData(d.data)
    setShowPayment(true)
    setLoading(false)
  }

  if (showPayment && subData) {
    return (
      <PaymentModal
        amountUsd={subData.payment.amount_usd}
        subscriptionId={subData.subscription.id}
        onSuccess={() => { onClose(); onSuccess?.() }}
        onClose={() => setShowPayment(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Subscribe to {agent.name}</h2>
            <p className="text-sm text-gray-400 mt-1">Save more with monthly plans</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {TIERS.map(tier => {
            const price = getPrice(tier)
            const perTask = getPricePerTask(tier)
            const oneOff = agent.price_usd * tier.tasks
            const saved = oneOff - price
            return (
              <button key={tier.key} onClick={() => setSelected(tier.key)}
                className={`text-left p-5 rounded-2xl border transition relative ${
                  selected === tier.key ? 'border-um-purple bg-um-purple/5' :
                  tier.popular ? 'border-um-purple/30 hover:border-um-purple' : 'border-um-border hover:border-gray-600'
                }`}>
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-um-purple to-um-pink text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>}
                <div className="text-2xl mb-2">{tier.icon}</div>
                <h3 className="text-white font-bold text-lg">{tier.label}</h3>
                <p className="text-gray-400 text-sm mt-1">{tier.tasks} tasks/month</p>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-white">${price}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">${perTask}/task</p>
                <div className="mt-3 bg-emerald-500/10 rounded-lg px-3 py-2">
                  <p className="text-emerald-400 text-xs font-bold">Save ${saved} ({tier.discount}%)</p>
                  <p className="text-gray-500 text-[10px]">vs ${oneOff} one-off</p>
                </div>
              </button>
            )
          })}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button onClick={subscribe} disabled={!selected || loading}
          className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg disabled:opacity-50">
          {loading ? 'Creating...' : selected ? `Subscribe — $${getPrice(TIERS.find(t => t.key === selected)!)}/mo` : 'Select a plan'}
        </button>
      </div>
    </div>
  )
}
