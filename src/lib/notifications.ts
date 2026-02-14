import { getServiceSupabase } from './supabase'

export type NotificationType = 'task_created' | 'task_completed' | 'task_reviewed' | 'subscription_activated' | 'payment_received'

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const sb = getServiceSupabase()
  const { data: notif, error } = await sb
    .from('um_notifications')
    .insert({ user_id: userId, type, title, message, data: data || {} })
    .select()
    .single()
  if (error) console.error('Notification error:', error)
  return notif
}
