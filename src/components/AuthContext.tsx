'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User { id: string; name: string; email: string; role: string; total_saved_usd?: number }
interface AuthCtx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<string | null>; register: (name: string, email: string, password: string) => Promise<string | null>; logout: () => Promise<void>; refresh: () => Promise<void> }

const Ctx = createContext<AuthCtx>({ user: null, loading: true, login: async () => null, register: async () => null, logout: async () => {}, refresh: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const res = await fetch('/api/auth/session')
      const d = await res.json()
      setUser(d.data || null)
    } catch { setUser(null) }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const d = await res.json()
    if (d.error) return d.error
    setUser(d.data)
    return null
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    const d = await res.json()
    if (d.error) return d.error
    setUser(d.data)
    return null
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>
}

export function useAuth() { return useContext(Ctx) }
