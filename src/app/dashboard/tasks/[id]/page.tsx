'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'

interface TaskDetail {
  id: string; title: string; description: string; status: string; tier: string
  price_usd: number; saved_usd: number; rating: number | null; review: string | null
  result: string | null; created_at: string; completed_at: string | null
  agent: { id: string; name: string; slug: string; avatar: string; tagline: string; verified: boolean } | null
}

const STEPS = ['pending', 'in_progress', 'completed']

export default function TaskDetail() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewed, setReviewed] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    fetch(`/api/tasks/${id}`).then(r => r.json()).then(d => { setTask(d.task || null); setLoading(false) })
  }, [id, user, authLoading, router])

  async function submitReview() {
    if (!rating) return
    setReviewing(true)
    await fetch(`/api/tasks/${id}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    })
    setReviewing(false); setReviewed(true)
  }

  if (loading || authLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!task) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-gray-500">Task not found</p></div>

  const stepIdx = STEPS.indexOf(task.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white transition mb-6 inline-block">← Back to Dashboard</Link>

      {/* Agent info */}
      {task.agent && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-2xl border border-um-border">{task.agent.avatar || '🤖'}</div>
          <div>
            <Link href={`/agents/${task.agent.slug}`} className="text-white font-bold hover:text-um-purple transition">{task.agent.name}</Link>
            <p className="text-xs text-gray-500">{task.agent.tagline}</p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-um-card border border-um-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          <span className="text-xs font-medium px-3 py-1 rounded-full border bg-um-purple/10 text-um-purple border-um-purple/20 capitalize">{task.status.replace('_', ' ')}</span>
        </div>
        {task.description && <p className="text-gray-300 mb-4 whitespace-pre-wrap">{task.description}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-um-bg rounded-xl p-3 text-center border border-um-border">
            <p className="text-xs text-gray-500">Tier</p>
            <p className="text-white font-medium capitalize">{task.tier}</p>
          </div>
          <div className="bg-um-bg rounded-xl p-3 text-center border border-um-border">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-white font-medium">${Number(task.price_usd).toLocaleString()}</p>
          </div>
          <div className="bg-um-bg rounded-xl p-3 text-center border border-um-border">
            <p className="text-xs text-gray-500">Saved</p>
            <p className="text-emerald-400 font-medium">${Number(task.saved_usd).toLocaleString()}</p>
          </div>
          <div className="bg-um-bg rounded-xl p-3 text-center border border-um-border">
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-white font-medium text-xs">{new Date(task.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIdx ? 'gradient-btn text-white' : 'bg-um-border text-gray-500'}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIdx ? 'bg-um-purple' : 'bg-um-border'}`} />}
            </div>
          ))}
        </div>
        <div className="flex mt-1">
          {STEPS.map(s => <div key={s} className="flex-1 text-center text-[10px] text-gray-500 capitalize">{s.replace('_', ' ')}</div>)}
        </div>
      </div>

      {/* Result / Deliverables */}
      {task.result && (
        <div className="bg-um-card border border-um-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">📦 Deliverables</h2>
            {task.completed_at && (
              <span className="text-xs px-3 py-1 rounded-full savings-badge text-white font-medium">
                ⚡ {Math.max(1, Math.round((Number(task.price_usd) || 10) * 0.8))}x faster than human
              </span>
            )}
          </div>
          {task.completed_at && (
            <p className="text-xs text-gray-500 mb-4">Completed {new Date(task.completed_at).toLocaleString()}</p>
          )}
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap text-sm leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_strong]:text-white">{task.result}</div>
        </div>
      )}

      {/* Review */}
      {task.status === 'completed' && !task.rating && !reviewed && (
        <div className="bg-um-card border border-um-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Leave a Review</h2>
          <div className="flex gap-2 mb-4">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setRating(i)} className="text-2xl transition hover:scale-110">
                {i <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple resize-none mb-4" />
          <button onClick={submitReview} disabled={!rating || reviewing} className="gradient-btn text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50">
            {reviewing ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {(task.rating || reviewed) && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
          <p className="text-emerald-400 font-bold">✅ Review submitted — thank you!</p>
        </div>
      )}
    </div>
  )
}
