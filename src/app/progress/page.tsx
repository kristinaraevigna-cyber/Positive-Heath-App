'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Completion = {
  id: string
  intervention_id: string
  mood_before: number
  mood_after: number
  completed_at: string
  interventions: {
    name: string
    category: string
  } | null
}

type Streak = {
  current_streak: number
  longest_streak: number
  total_interventions_completed: number
  last_activity_date: string
}

type JournalEntry = {
  id: string
  entry_type: string
  created_at: string
}

export default function ProgressPage() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [journalCount, setJournalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [avgMoodChange, setAvgMoodChange] = useState(0)
  const [weeklyActivity, setWeeklyActivity] = useState<{ [key: string]: number }>({})
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load streak
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setStreak(streakData)

    // Load completions with intervention details
    const { data: completionsData } = await supabase
      .from('intervention_completions')
      .select(`
        id,
        intervention_id,
        mood_before,
        mood_after,
        completed_at,
        interventions (
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50)

    setCompletions(completionsData || [])

    // Calculate average mood change
    if (completionsData && completionsData.length > 0) {
      const totalChange = completionsData.reduce((sum, c) => {
        if (c.mood_before && c.mood_after) {
          return sum + (c.mood_after - c.mood_before)
        }
        return sum
      }, 0)
      const completionsWithMood = completionsData.filter(c => c.mood_before && c.mood_after).length
      if (completionsWithMood > 0) {
        setAvgMoodChange(Number((totalChange / completionsWithMood).toFixed(1)))
      }
    }

    // Calculate weekly activity
    const last7Days: { [key: string]: number } = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      last7Days[key] = 0
    }

    completionsData?.forEach(c => {
      const date = c.completed_at.split('T')[0]
      if (last7Days.hasOwnProperty(date)) {
        last7Days[date]++
      }
    })

    setWeeklyActivity(last7Days)

    // Load journal count
    const { count } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setJournalCount(count || 0)

    setLoading(false)
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch(category?.toLowerCase()) {
      case 'calming': return 'bg-[#e0f2fe] text-[#0284c7]'
      case 'energising': return 'bg-[#fef3eb] text-[#e07a3a]'
      case 'coping': return 'bg-[#f5f3ff] text-[#7c3aed]'
      case 'feeling good': return 'bg-[#e3e7e3] text-[#5f7360]'
      case 'meaning': return 'bg-[#fce7f3] text-[#db2777]'
      case 'relationship': return 'bg-[#fee2e2] text-[#ee5a5a]'
      case 'prospecting': return 'bg-[#f5f0eb] text-[#7a6150]'
      default: return 'bg-[#f8f6f3] text-[#6b6b6b]'
    }
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

  const maxActivity = Math.max(...Object.values(weeklyActivity), 1)

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Your Progress</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Current Streak */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df] text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fef3eb] to-[#fde5d5] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#e07a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#2d2d2d]">{streak?.current_streak || 0}</p>
            <p className="text-sm text-[#6b6b6b]">Day Streak</p>
          </div>

          {/* Total Completed */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df] text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#2d2d2d]">{streak?.total_interventions_completed || 0}</p>
            <p className="text-sm text-[#6b6b6b]">Completed</p>
          </div>

          {/* Avg Mood Change */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df] text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#2d2d2d]">
              {avgMoodChange > 0 ? '+' : ''}{avgMoodChange}
            </p>
            <p className="text-sm text-[#6b6b6b]">Avg Mood Lift</p>
          </div>

          {/* Journal Entries */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df] text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#db2777]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#2d2d2d]">{journalCount}</p>
            <p className="text-sm text-[#6b6b6b]">Journal Entries</p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-8">
          <h2 className="font-semibold text-[#2d2d2d] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            This Week
          </h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {Object.entries(weeklyActivity).map(([date, count]) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-[#ee5a5a] to-[#f87171] rounded-t-lg transition-all"
                  style={{ 
                    height: count > 0 ? `${(count / maxActivity) * 100}%` : '4px',
                    minHeight: '4px',
                    opacity: count > 0 ? 1 : 0.2
                  }}
                />
                <span className="text-xs text-[#6b6b6b]">{getDayName(date)}</span>
              </div>
            ))}
          </div>
          {Object.values(weeklyActivity).every(v => v === 0) && (
            <p className="text-center text-[#6b6b6b] text-sm mt-4">
              Complete interventions to see your activity
            </p>
          )}
        </div>

        {/* Longest Streak */}
        {(streak?.longest_streak || 0) > 0 && (
          <div className="bg-gradient-to-br from-[#fef3eb] to-[#fde5d5] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-[#e07a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#7a6150]">Personal Best</p>
                <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.longest_streak} Day Streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            Recent Activity
          </h2>
          
          {completions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#f8f6f3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] mb-4">No activity yet</p>
              <Link
                href="/interventions"
                className="inline-flex items-center gap-2 text-[#ee5a5a] font-medium hover:text-[#d94848] transition"
              >
                Start an intervention
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {completions.slice(0, 10).map((completion) => {
                const moodChange = completion.mood_after - completion.mood_before
                return (
                  <div key={completion.id} className="flex items-center gap-4 p-3 bg-[#f8f6f3] rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(completion.interventions?.category)}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2d2d2d] text-sm truncate">
                        {completion.interventions?.name || 'Intervention'}
                      </p>
                      <p className="text-xs text-[#6b6b6b]">{formatDate(completion.completed_at)}</p>
                    </div>
                    {completion.mood_before && completion.mood_after && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6b6b6b]">{completion.mood_before}</span>
                        <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="text-sm text-[#6b6b6b]">{completion.mood_after}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          moodChange > 0 
                            ? 'bg-[#e3e7e3] text-[#5f7360]' 
                            : moodChange < 0 
                              ? 'bg-[#fee2e2] text-[#ee5a5a]'
                              : 'bg-[#f8f6f3] text-[#6b6b6b]'
                        }`}>
                          {moodChange > 0 ? '+' : ''}{moodChange}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Encouragement */}
        {completions.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-[#6b6b6b] text-sm">
              Keep going! Every small step builds positive health.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
