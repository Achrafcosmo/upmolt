import { getSession } from './auth'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
const FALLBACK_ADMIN = 'cosmo2top@gmail.com'

function isAdminEmail(email: string): boolean {
  const e = email.toLowerCase()
  return e === FALLBACK_ADMIN || ADMIN_EMAILS.includes(e)
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSession()
  if (!user) return false
  return isAdminEmail(user.email || '')
}

export async function requireAdmin() {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')
  if (!isAdminEmail(user.email || '')) throw new Error('Not admin')
  return user
}
