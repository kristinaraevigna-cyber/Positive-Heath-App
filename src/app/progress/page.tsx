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
}

interface CoachingSession {
  id: string
  session_type: string
  created_at: string
}

export default function ProgressPage() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([])
  const [totalCoachingSessions, setTotalCoachingSessions] = useState(0)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [totalGoals, setTotalGoals] = useState(0)
  const [completedGoals, setCompletedGoals] = useState(0)
  const [journalEntries, setJournalEntries] = useState(0)
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
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10)

    setCompletions(completionsData || [])

    // Load coaching sessions
    const { data: sessionsData, count: sessionsCount } = await supabase
      .from('coaching_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setCoachingSessions(sessionsData || [])
    setTotalCoachingSessions(sessionsCount || 0)

    // Calculate weekly intervention count
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

    // Load goals stats
    const { count: totalGoalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setTotalGoals(totalGoalsCount || 0)

    const { count: completedGoalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    setCompletedGoals(completedGoalsCount || 0)

    // Load journal entries count
    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setJournalEntries(journalCount || 0)

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

        {/* Activity Stats */}
        <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Activity Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.total_interventions_completed || 0}</p>
            <p className="text-xs text-[#6b6b6b]">Interventions</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{totalCoachingSessions}</p>
            <p className="text-xs text-[#6b6b6b]">Coaching Sessions</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#db2777]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{journalEntries}</p>
            <p className="text-xs text-[#6b6b6b]">Journal Entries</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#2d2d2d]">{completedGoals}/{totalGoals}</p>
            <p className="text-xs text-[#6b6b6b]">Goals Completed</p>
          </div>
        </div>

        {/* Time-based Stats */}
        <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Intervention Progress
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <p className="text-3xl font-bold text-[#2d2d2d]">{weeklyCount}</p>
            <p className="text-sm text-[#6b6b6b]">This Week</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <p className="text-3xl font-bold text-[#2d2d2d]">{monthlyCount}</p>
            <p className="text-sm text-[#6b6b6b]">This Month</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-center">
            <p className="text-3xl font-bold text-[#2d2d2d]">{streak?.total_minutes_practiced || 0}</p>
            <p className="text-sm text-[#6b6b6b]">Minutes Total</p>
          </div>
        </div>

        {/* Recent Coaching Sessions */}
        {coachingSessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                Recent Coaching Sessions
              </h2>
              <Link href="/coach" className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
                Start new
              </Link>
            </div>
            <div className="space-y-3">
              {coachingSessions.map((session) => {
                return (
                  <div key={session.id} className="flex items-center gap-4 p-3 bg-[#f8f6f3] rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2d2d2d] font-medium text-sm capitalize">
                        {session.session_type || 'Coaching'} Session
                      </p>
                    </div>
                    <span className="text-xs text-[#6b6b6b] flex-shrink-0">
                      {formatDate(session.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Intervention Activity */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent Interventions
            </h2>
            <Link href="/interventions" className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
              View all
            </Link>
          </div>

          {completions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#f8f6f3] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] mb-3">No interventions completed yet</p>
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

        {/* Keep Going CTA */}
        <div className="bg-gradient-to-br from-[#5f7360] to-[#4a5a4b] rounded-2xl p-6 text-center text-white">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Keep Building Your Practice!
          </h2>
          <p className="text-white/80 mb-4 text-sm">
            Every session brings you closer to lasting wellbeing
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/interventions" className="inline-flex items-center gap-2 bg-white text-[#5f7360] px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition">
              Interventions
            </Link>
            <Link href="/coach" className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/30 transition">
              Coach
            </Link>
            <Link href="/journal" className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/30 transition">
              Journal
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}


