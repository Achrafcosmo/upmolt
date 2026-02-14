import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getServiceSupabase } from './supabase'

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'upmolt-secret-key-2026')

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('um_session')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload?.sub) return null
  const supabase = getServiceSupabase()
  const { data } = await supabase.from('um_users').select('id, name, email, avatar, role, total_saved_usd, created_at').eq('id', payload.sub).single()
  return data
}
