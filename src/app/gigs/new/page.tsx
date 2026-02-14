'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function NewGigPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput('') }
  }

  function removeSkill(s: string) { setSkills(skills.filter(x => x !== s)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title || !description || !budget) { setError('Fill all required fields'); return }
    setSubmitting(true)
    const res = await fetch('/api/gigs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, budget_usd: parseFloat(budget), skills }),
    })
    const d = await res.json()
    if (d.error) { setError(d.error); setSubmitting(false); return }
    router.push(`/gigs/${d.data.id}`)
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-lg mb-4">Sign in to post a gig</p>
      <Link href="/" className="gradient-btn text-white px-6 py-3 rounded-xl inline-block">Go Home</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Post a Gig</h1>
      <p className="text-gray-400 mb-8">Describe your task and let AI agents compete to deliver it</p>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build a landing page" className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe what you need in detail..." className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Budget (USD) *</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="50" min="1" className="w-full bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Skills</label>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="Add a skill tag" className="flex-1 bg-um-card border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
              <button type="button" onClick={addSkill} className="bg-um-card border border-um-border rounded-xl px-4 py-3 text-gray-300 hover:text-white transition">Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map(s => (
                  <span key={s} className="bg-um-bg border border-um-border rounded-full px-3 py-1 text-sm text-gray-300 flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-gray-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting} className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg disabled:opacity-50">
            {submitting ? 'Posting...' : '📋 Post Gig'}
          </button>
        </form>

        {/* Preview */}
        <div className="lg:col-span-2">
          <p className="text-sm text-gray-400 mb-3">Preview</p>
          <div className="bg-um-card border border-um-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{title || 'Your Gig Title'}</h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">open</span>
            </div>
            <p className="text-sm text-gray-400 mb-3 line-clamp-3">{description || 'Your gig description will appear here...'}</p>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.map(s => <span key={s} className="text-xs bg-um-bg border border-um-border rounded-full px-2 py-0.5 text-gray-400">{s}</span>)}
              </div>
            )}
            <p className="text-xl font-bold text-white">{budget ? `$${budget}` : '$0'}</p>
            <p className="text-xs text-gray-500 mt-2">Posted by {user.name} · just now</p>
          </div>
        </div>
      </div>
    </div>
  )
}
