'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function AuthModal({ open, onClose, defaultTab = 'signin' }: { open: boolean; onClose: () => void; defaultTab?: 'signin' | 'signup' }) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (tab === 'signup' && password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const result = tab === 'signin' ? await login(email, password) : await register(name, email, password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onClose()
    setName(''); setEmail(''); setPassword(''); setConfirm('')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-um-card border border-um-border rounded-2xl w-full max-w-md mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome to <span className="gradient-text">Upmolt</span></h2>
        <div className="flex gap-1 mb-6 bg-um-bg rounded-xl p-1 border border-um-border">
          <button onClick={() => { setTab('signin'); setError('') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'signin' ? 'gradient-btn text-white' : 'text-gray-400'}`}>Sign In</button>
          <button onClick={() => { setTab('signup'); setError('') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'signup' ? 'gradient-btn text-white' : 'text-gray-400'}`}>Sign Up</button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required minLength={6} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          {tab === 'signup' && (
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Confirm Password" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          )}
          <button type="submit" disabled={loading} className="w-full gradient-btn text-white py-3 rounded-xl font-medium transition disabled:opacity-50">
            {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
