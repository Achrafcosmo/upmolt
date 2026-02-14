'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-um-bg/80 backdrop-blur-xl border-b border-um-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-btn rounded-lg flex items-center justify-center text-white font-bold text-sm">U</div>
          <span className="text-xl font-bold text-white">Upmolt</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/agents" className="text-sm text-gray-400 hover:text-white transition">Browse Agents</Link>
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it Works</a>
          <a href="#categories" className="text-sm text-gray-400 hover:text-white transition">Categories</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm text-gray-300 hover:text-white transition px-4 py-2">Sign In</button>
          <button className="gradient-btn text-white text-sm px-5 py-2 rounded-lg transition font-medium">Get Started</button>
        </div>
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-um-border px-4 py-4 space-y-3 bg-um-bg/95 backdrop-blur-xl">
          <Link href="/agents" className="block text-sm text-gray-400 hover:text-white">Browse Agents</Link>
          <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-white">How it Works</a>
          <a href="#categories" className="block text-sm text-gray-400 hover:text-white">Categories</a>
          <button className="w-full gradient-btn text-white text-sm px-5 py-2 rounded-lg mt-2">Get Started</button>
        </nav>
      )}
    </header>
  )
}
