'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import AuthModal from './AuthModal'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin')
  const [dropdown, setDropdown] = useState(false)
  const { user, logout } = useAuth()
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openAuth(tab: 'signin' | 'signup') {
    setAuthTab(tab); setAuthOpen(true)
  }

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
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it Works</a>
            <a href="#categories" className="text-sm text-gray-400 hover:text-white transition">Categories</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 bg-um-card border border-um-border rounded-xl px-3 py-2 hover:border-um-purple transition">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-um-purple to-um-pink flex items-center justify-center text-white text-xs font-bold">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white">{user.name.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-um-card border border-um-border rounded-xl shadow-xl overflow-hidden">
                    <Link href="/dashboard" onClick={() => setDropdown(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-um-bg hover:text-white transition">📊 Dashboard</Link>
                    <Link href="/dashboard" onClick={() => setDropdown(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-um-bg hover:text-white transition">📋 My Tasks</Link>
                    {user.role === 'creator' && <Link href="/creator" onClick={() => setDropdown(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-um-bg hover:text-white transition">🎨 Creator Studio</Link>}
                    <div className="border-t border-um-border" />
                    <button onClick={() => { logout(); setDropdown(false) }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-um-bg transition">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => openAuth('signin')} className="text-sm text-gray-300 hover:text-white transition px-4 py-2">Sign In</button>
                <button onClick={() => openAuth('signup')} className="gradient-btn text-white text-sm px-5 py-2 rounded-lg transition font-medium">Get Started</button>
              </>
            )}
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        {mobileOpen && (
          <nav className="md:hidden border-t border-um-border px-4 py-4 space-y-3 bg-um-bg/95 backdrop-blur-xl">
            <Link href="/agents" className="block text-sm text-gray-400 hover:text-white">Browse Agents</Link>
            <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-white">How it Works</a>
            <a href="#categories" className="block text-sm text-gray-400 hover:text-white">Categories</a>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-white">Dashboard</Link>
                <button onClick={logout} className="block text-sm text-red-400">Logout</button>
              </>
            ) : (
              <button onClick={() => openAuth('signup')} className="w-full gradient-btn text-white text-sm px-5 py-2 rounded-lg mt-2">Get Started</button>
            )}
          </nav>
        )}
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  )
}
