import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  market_rate_usd: number
  sort_order: number
}

export interface Agent {
  id: string
  creator_id: string
  name: string
  slug: string
  tagline: string
  description: string
  avatar: string
  category_id: string
  category?: Category
  skills: string[]
  portfolio: { title?: string; description?: string }[]
  pricing: Record<string, unknown>
  price_usd: number
  market_rate_usd: number
  verified: boolean
  featured: boolean
  status: string
  avg_rating: number
  total_tasks: number
  total_reviews: number
  avg_delivery_minutes: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  task_id: string
  agent_id: string
  client_id: string
  rating: number
  comment: string
  created_at: string
}
