import { getSession } from './auth'

const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim()).filter(Boolean)

export async function isAdmin(): Promise<boolean> {
  const user = await getSession()
  if (!user) return false
  return ADMIN_WALLETS.includes(user.wallet || '')
}

export async function requireAdmin() {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')
  if (!ADMIN_WALLETS.includes(user.wallet || '')) throw new Error('Not admin')
  return user
}
