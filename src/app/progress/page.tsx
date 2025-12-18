'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Streak {
  current_streak: number
  longest_streak: number
  total_interventions_completed: number
  total_minutes_practiced: number
  last_activity_date: string | null
}

interface Completion {
  id: string
  intervention_id: string
  completed_at: string
  mood_before: number | null
  mood_after: number | null
  notes: string | null
  intervention?: {
    title: string
    category: string
  }
}

export default function ProgressPage() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/study-info')
      return
    }

    // Load streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (streakData) {
      setStreak(streakData)
    } else {
      // Create streak record if doesn't exist
      const { data: newStreak } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          total_interventions_completed: 0,
          total_minutes_practiced: 0,
        })
        .select()
        .single()
      
      setStreak(newStreak)
    }

    // Load recent completions
    const { data: completionsData } = await supabase
      .from('intervention_completions')
      .select(`
        id,
        intervention_id,
        completed_at,
        mood_before,
        mood_after,
        notes
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20)

    setCompletions(completionsData || [])

    // Calculate weekly count
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const { count: weekly } = await supabase
      .from('intervention_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('completed_at', weekAgo.toISOString())

    setWeeklyCount(weekly || 0)

    // Calculate monthly count
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    const { count: monthly } = await supabase
      .from('intervention_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('completed_at', monthAgo.toISOString())

    setMonthlyCount(monthly || 0)

    setLoading(false)
  }

  const getStreakMessage = () => {
    if (!streak) return ''
    if (streak.current_streak === 0) return 'Start your first activity to begin a streak!'
    if (streak.current_streak === 1) return 'Great start! Keep it going tomorrow.'
    if (streak.current_streak < 7) return `${streak.current_streak} days strong! Can you make it a week?`
    if (streak.current_streak < 30) return `${streak.current_streak} days! You're building a great habit.`
    return `${streak.current_streak} days! You're on fire! 🔥`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-[#6b6b6b]">Loading progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Progress</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Current Streak</p>
              <p className="text-4xl font-bold">{streak?.current_streak || 0} days</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm">{getStreakMessage()}</p>
          {streak?.longest_streak && streak.longest_streak > 0 && (
            <p className="text-white/70 text-xs mt-2">Personal best: {streak.longest_streak} days</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.total_interventions_completed || 0}</p>
            <p className="text-xs text-[#6b6b6b]">Total Completed</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{weeklyCount}</p>
            <p className="text-xs text-[#6b6b6b]">This Week</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#fef3eb] to-[#fde5d5] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#e07a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{monthlyCount}</p>
            <p className="text-xs text-[#6b6b6b]">This Month</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.total_minutes_practiced || 0}</p>
            <p className="text-xs text-[#6b6b6b]">Minutes Practiced</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Recent Activity
          </h2>

          {completions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#f8f6f3] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] mb-3">No activities completed yet</p>
              <Link href="/interventions" className="inline-flex items-center gap-1 text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
                Start your first intervention
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {completions.map((completion) => {
                return (
                  <div key={completion.id} className="flex items-center gap-4 p-3 bg-[#f8f6f3] rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2d2d2d] font-medium text-sm">
                        Completed intervention
                      </p>
                      {completion.mood_before && completion.mood_after && (
                        <p className="text-xs text-[#6b6b6b]">
                          Mood: {completion.mood_before} → {completion.mood_after}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[#6b6b6b] flex-shrink-0">
                      {formatDate(completion.completed_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Start Activity CTA */}
        <div className="mt-6 bg-gradient-to-br from-[#5f7360] to-[#4a5a4b] rounded-2xl p-6 text-center text-white">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Keep Your Streak Going!
          </h2>
          <p className="text-white/80 mb-4 text-sm">
            Complete an intervention today to maintain your progress
          </p>
          <Link href="/interventions" className="inline-flex items-center gap-2 bg-white text-[#5f7360] px-6 py-3 rounded-xl font-medium hover:shadow-lg transition">
            Browse Interventions
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}

