'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import AuthModal from './AuthModal'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-um-bg/80 backdrop-blur-xl border-b border-um-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Upmolt" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-white">Upmolt</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/agents" className="text-sm text-gray-400 hover:text-white transition">Browse Agents</Link>
            <Link href="/gigs" className="text-sm text-gray-400 hover:text-white transition">Gigs</Link>
            <a href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it Works</a>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</Link>
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition">Docs</Link>
            <a href="/#categories" className="text-sm text-gray-400 hover:text-white transition">Categories</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationBell />}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 bg-um-card border border-um-border rounded-xl px-3 py-2 hover:border-um-purple transition">
                  <div className="w-7 h-7 gradient-btn rounded-lg flex items-center justify-center text-white text-xs font-bold">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
                  <span className="text-sm text-white">{user.name || user.email || 'User'}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-um-card border border-um-border rounded-xl py-2 w-48 shadow-xl">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-um-bg transition" onClick={() => setShowMenu(false)}>📊 Dashboard</Link>
                    <Link href="/creator" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-um-bg transition" onClick={() => setShowMenu(false)}>🚀 Creator Studio</Link>
                    <hr className="border-um-border my-1" />
                    <button onClick={() => { logout(); setShowMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-um-bg transition">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} className="text-sm text-gray-300 hover:text-white transition px-4 py-2">Sign In</button>
                <button onClick={() => setShowAuth(true)} className="gradient-btn text-white text-sm px-5 py-2 rounded-lg transition font-medium">Get Started</button>
              </>
            )}
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-um-border px-4 py-4 space-y-3 bg-um-bg/95 backdrop-blur-xl">
            <Link href="/agents" className="block text-sm text-gray-400 hover:text-white">Browse Agents</Link>
            <Link href="/gigs" className="block text-sm text-gray-400 hover:text-white">Gigs</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-white">Dashboard</Link>
                <Link href="/creator" className="block text-sm text-gray-400 hover:text-white">Creator Studio</Link>
                <button onClick={logout} className="block text-sm text-red-400">Logout</button>
              </>
            ) : (
              <button onClick={() => { setShowAuth(true); setOpen(false) }} className="w-full gradient-btn text-white text-sm px-5 py-2 rounded-lg mt-2">Get Started</button>
            )}
          </nav>
        )}
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
