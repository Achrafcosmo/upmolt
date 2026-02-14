'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (tab === 'register') {
      if (password !== confirm) { setError('Passwords do not match'); setLoading(false); return }
      const err = await register(name, email, password)
      if (err) { setError(err); setLoading(false); return }
    } else {
      const err = await login(email, password)
      if (err) { setError(err); setLoading(false); return }
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">×</button>
        <div className="flex gap-1 mb-6 bg-um-bg rounded-xl p-1">
          <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === 'login' ? 'gradient-btn text-white' : 'text-gray-400'}`}>Sign In</button>
          <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === 'register' ? 'gradient-btn text-white' : 'text-gray-400'}`}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          {tab === 'register' && (
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" required className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple" />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full gradient-btn text-white py-3 rounded-xl font-medium transition disabled:opacity-50">
            {loading ? 'Loading...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
