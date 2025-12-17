'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type UserStreak = {
  current_streak: number
  longest_streak: number
  total_interventions_completed: number
  last_activity_date: string
}

type Goal = {
  id: string
  title: string
  status: string
}

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [weeklyCompletions, setWeeklyCompletions] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0])
      }

      // Load streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setStreak(streakData)

      // Load active goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(5)

      setActiveGoals(goalsData || [])

      // Load weekly completions
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { count } = await supabase
        .from('intervention_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString())

      setWeeklyCompletions(count || 0)

      setLoading(false)
    }

    loadDashboard()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
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
          <p className="text-[#6b6b6b]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Positive Health Coach
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f8f6f3] rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#2d2d2d] transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#2d2d2d] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-[#6b6b6b]">How can I support your wellbeing today?</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Current Streak */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#fef3eb] to-[#fde5d5] rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#e07a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.current_streak || 0}</p>
              <p className="text-sm text-[#6b6b6b]">Day Streak</p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#2d2d2d]">{streak?.total_interventions_completed || 0}</p>
              <p className="text-sm text-[#6b6b6b]">Completed</p>
            </div>
          </div>

          {/* Active Goals */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#2d2d2d]">{activeGoals.length}</p>
              <p className="text-sm text-[#6b6b6b]">Active Goals</p>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4df]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#2d2d2d]">{weeklyCompletions}</p>
              <p className="text-sm text-[#6b6b6b]">This Week</p>
            </div>
          </div>
        </div>

        {/* View Progress Link */}
        <div className="flex justify-end mb-8">
          <Link 
            href="/progress" 
            className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition flex items-center gap-1"
          >
            View detailed progress
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* Coach */}
          <Link
            href="/coach"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Coach</h3>
              <p className="text-xs text-[#6b6b6b]">Chat session</p>
            </div>
          </Link>

          {/* Interventions */}
          <Link
            href="/interventions"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Interventions</h3>
              <p className="text-xs text-[#6b6b6b]">15 activities</p>
            </div>
          </Link>

          {/* Goals */}
          <Link
            href="/goals"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Goals</h3>
              <p className="text-xs text-[#6b6b6b]">SMART goals</p>
            </div>
          </Link>

          {/* Journal */}
          <Link
            href="/journal"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Journal</h3>
              <p className="text-xs text-[#6b6b6b]">Reflections</p>
            </div>
          </Link>

          {/* Strengths */}
          <Link
            href="/strengths"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#db2777]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Strengths</h3>
              <p className="text-xs text-[#6b6b6b]">VIA Character</p>
            </div>
          </Link>

          {/* Progress */}
          <Link
            href="/progress"
            className="bg-white p-5 rounded-2xl border border-[#e8e4df] hover:shadow-lg hover:border-[#d4c4b5] transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="font-medium text-[#2d2d2d] mb-1">Progress</h3>
              <p className="text-xs text-[#6b6b6b]">Your stats</p>
            </div>
          </Link>
        </div>

        {/* Active Goals Section */}
        {activeGoals.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                Active Goals
              </h2>
              <Link href="/goals" className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-3 bg-[#f8f6f3] rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                    </svg>
                  </div>
                  <span className="text-[#2d2d2d] text-sm flex-1 truncate">{goal.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Coaching CTA */}
        <div className="bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl p-6 text-center text-white mb-8">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Ready for a coaching session?
          </h2>
          <p className="text-white/80 mb-4 text-sm">
            Quick check-in or deep strengths exploration
          </p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 bg-white text-[#ee5a5a] px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
          >
            Start Coaching
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-[#6b6b6b]">
          <p>Based on lifestyle medicine research • Burke et al. (2023)</p>
        </div>
      </main>
    </div>
  )
}