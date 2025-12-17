import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export type Profile = {
  id: string
  full_name: string | null
  preferred_language: string
  timezone: string
  onboarding_completed: boolean
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  target_date: string | null
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  created_at: string
}

export type Message = {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type CoachingSession = {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  session_type: string
  summary: string | null
}