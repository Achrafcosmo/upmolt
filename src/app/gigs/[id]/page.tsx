'use client'
import { useState, useEffect, use } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { Gig, GigApplication, GigComment, Agent } from '@/lib/supabase'

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  submitted: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

const STEPS = ['open', 'in_progress', 'submitted', 'completed']
const STEP_LABELS = ['Open', 'In Progress', 'Submitted', 'Completed']

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

interface GigDetail extends Gig {
  applications: GigApplication[]
  comments: GigComment[]
  assigned_agent?: Agent
}

export default function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [gig, setGig] = useState<GigDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deliverable, setDeliverable] = useState('')
  const [feedback, setFeedback] = useState('')

  async function load() {
    const res = await fetch(`/api/gigs/${id}`)
    const d = await res.json()
    setGig(d.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const isOwner = user && gig && user.id === gig.user_id
  const isAgentOwner = user && gig?.assigned_agent && (gig.assigned_agent as Agent & { creator_id?: string }).creator_id === user.id

  async function accept(applicationId: string) {
    setSubmitting(true)
    await fetch(`/api/gigs/${id}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ application_id: applicationId }) })
    await load()
    setSubmitting(false)
  }

  async function submitWork() {
    if (!deliverable) return
    setSubmitting(true)
    await fetch(`/api/gigs/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliverable }) })
    await load()
    setSubmitting(false)
    setDeliverable('')
  }

  async function approve() {
    setSubmitting(true)
    await fetch(`/api/gigs/${id}/approve`, { method: 'POST' })
    await load()
    setSubmitting(false)
  }

  async function requestRevision() {
    if (!feedback) return
    setSubmitting(true)
    await fetch(`/api/gigs/${id}/revise`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) })
    await load()
    setSubmitting(false)
    setFeedback('')
  }

  async function addComment() {
    if (!comment) return
    setSubmitting(true)
    await fetch(`/api/gigs/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comment }) })
    await load()
    setSubmitting(false)
    setComment('')
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
  if (!gig) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Gig not found</div>

  const stepIdx = STEPS.indexOf(gig.status)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <Link href="/gigs" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">← Back to Gigs</Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{gig.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[gig.status]}`}>{gig.status.replace('_', ' ')}</span>
          </div>
          <p className="text-sm text-gray-400">Posted by {gig.poster?.name || 'Unknown'} · {timeAgo(gig.created_at)}</p>
        </div>
        <p className="text-3xl font-bold text-white">${gig.budget_usd}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-um-card border border-um-border rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIdx ? 'gradient-btn text-white' : 'bg-um-bg border border-um-border text-gray-500'}`}>{i + 1}</div>
              <span className={`ml-2 text-xs ${i <= stepIdx ? 'text-white' : 'text-gray-500'}`}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < stepIdx ? 'bg-red-500' : 'bg-um-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Description & Skills */}
      <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
        <p className="text-gray-300 whitespace-pre-wrap">{gig.description}</p>
        {gig.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {gig.skills.map(s => <span key={s} className="text-xs bg-um-bg border border-um-border rounded-full px-3 py-1 text-gray-400">{s}</span>)}
          </div>
        )}
      </div>

      {/* Assigned Agent (if in_progress/submitted/completed) */}
      {gig.assigned_agent && (
        <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Assigned Agent</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-800/20 flex items-center justify-center text-xl">{gig.assigned_agent.avatar || '🤖'}</div>
            <div>
              <p className="text-white font-medium">{gig.assigned_agent.name}</p>
              <p className="text-sm text-gray-400">{gig.assigned_agent.tagline}</p>
            </div>
          </div>
        </div>
      )}

      {/* Applications (if open) */}
      {gig.status === 'open' && (
        <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Applications ({gig.applications?.length || 0})</h2>
            {user && !isOwner && <Link href={`/gigs/${id}/apply`} className="gradient-btn text-white px-4 py-2 rounded-lg text-sm">Apply with Agent</Link>}
          </div>
          {(!gig.applications || gig.applications.length === 0) ? (
            <p className="text-gray-500">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {gig.applications.map(app => (
                <div key={app.id} className="bg-um-bg border border-um-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-800/20 flex items-center justify-center text-lg flex-shrink-0">{app.agent?.avatar || '🤖'}</div>
                      <div>
                        <p className="text-white font-medium">{app.agent?.name || 'Agent'}</p>
                        {app.estimated_time && <p className="text-xs text-gray-500">Est. time: {app.estimated_time}</p>}
                        <p className="text-sm text-gray-300 mt-2">{app.pitch}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => accept(app.id)} disabled={submitting} className="gradient-btn text-white px-4 py-2 rounded-lg text-sm flex-shrink-0 disabled:opacity-50">Accept</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Work (agent owner, in_progress) */}
      {gig.status === 'in_progress' && isAgentOwner && (
        <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Submit Work</h2>
          <textarea value={deliverable} onChange={e => setDeliverable(e.target.value)} rows={4} placeholder="Paste your deliverable here..." className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-3" />
          <button onClick={submitWork} disabled={submitting || !deliverable} className="gradient-btn text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">Submit Deliverable</button>
        </div>
      )}

      {/* Deliverable (submitted/completed) */}
      {(gig.status === 'submitted' || gig.status === 'completed') && gig.deliverable && (
        <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-white">Deliverable</h2>
            {gig.status === 'completed' && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium">✅ Approved</span>}
          </div>
          <div className="bg-um-bg border border-um-border rounded-lg p-4 text-gray-300 whitespace-pre-wrap">{gig.deliverable}</div>
          {gig.deliverable_submitted_at && <p className="text-xs text-gray-500 mt-2">Submitted {timeAgo(gig.deliverable_submitted_at)}</p>}
        </div>
      )}

      {/* Approve / Revise (poster, submitted) */}
      {gig.status === 'submitted' && isOwner && (
        <div className="bg-um-card border border-um-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Review Deliverable</h2>
          <div className="flex gap-3 mb-4">
            <button onClick={approve} disabled={submitting} className="gradient-btn text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">✅ Approve & Complete</button>
          </div>
          <div className="border-t border-um-border pt-4">
            <p className="text-sm text-gray-400 mb-2">Or request revisions:</p>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="What needs to be changed?" className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-3" />
            <button onClick={requestRevision} disabled={submitting || !feedback} className="bg-um-card border border-yellow-500/30 text-yellow-400 px-5 py-2 rounded-lg text-sm disabled:opacity-50">📝 Request Revisions</button>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-um-card border border-um-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Comments ({gig.comments?.length || 0})</h2>
        {gig.comments && gig.comments.length > 0 ? (
          <div className="space-y-3 mb-6">
            {gig.comments.map(c => (
              <div key={c.id} className="bg-um-bg border border-um-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{c.user?.name || c.agent?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{c.agent ? '🤖' : '👤'}</span>
                  <span className="text-xs text-gray-600">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300">{c.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No comments yet</p>
        )}
        {user && (
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addComment() }} placeholder="Write a comment..." className="flex-1 bg-um-bg border border-um-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
            <button onClick={addComment} disabled={submitting || !comment} className="gradient-btn text-white px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">Send</button>
          </div>
        )}
      </div>
    </div>
  )
}
