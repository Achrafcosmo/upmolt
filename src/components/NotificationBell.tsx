'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string; type: string; title: string; message: string; read: boolean; data: Record<string, unknown>; created_at: string
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCount()
    const i = setInterval(fetchCount, 30000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function fetchCount() {
    try {
      const r = await fetch('/api/notifications/unread')
      const d = await r.json()
      setCount(d.count || 0)
    } catch {}
  }

  async function toggle() {
    if (!open) {
      const r = await fetch('/api/notifications')
      const d = await r.json()
      setNotifications(d.notifications || [])
    }
    setOpen(!open)
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
    setCount(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  function clickNotif(n: Notification) {
    if (!n.read) {
      fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id }) })
      setCount(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (n.data?.task_id) router.push(`/dashboard/tasks/${n.data.task_id}`)
  }

  function timeAgo(d: string) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 text-gray-400 hover:text-white transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 gradient-btn rounded-full text-[10px] font-bold text-white flex items-center justify-center">{count > 9 ? '9+' : count}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-um-card border border-um-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-um-border">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {count > 0 && <button onClick={markAllRead} className="text-xs text-um-purple hover:text-um-pink transition">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No notifications</p>
            ) : notifications.map(n => (
              <button key={n.id} onClick={() => clickNotif(n)} className={`w-full text-left px-4 py-3 hover:bg-um-bg transition border-b border-um-border/50 ${!n.read ? 'bg-um-purple/5' : ''}`}>
                <p className="text-sm text-white font-medium">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
