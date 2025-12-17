'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
]

type UserStrength = {
  top_strengths: string[]
}

type Stats = {
  totalSessions: number
  totalInterventions: number
  totalJournalEntries: number
  totalGoals: number
  currentStreak: number
  longestStreak: number
  memberSince: string
}

const VIA_STRENGTHS_MAP: { [key: string]: string } = {
  'creativity': 'Creativity',
  'curiosity': 'Curiosity',
  'judgment': 'Judgment',
  'love_of_learning': 'Love of Learning',
  'perspective': 'Perspective',
  'bravery': 'Bravery',
  'perseverance': 'Perseverance',
  'honesty': 'Honesty',
  'zest': 'Zest',
  'love': 'Love',
  'kindness': 'Kindness',
  'social_intelligence': 'Social Intelligence',
  'teamwork': 'Teamwork',
  'fairness': 'Fairness',
  'leadership': 'Leadership',
  'forgiveness': 'Forgiveness',
  'humility': 'Humility',
  'prudence': 'Prudence',
  'self_regulation': 'Self-Regulation',
  'appreciation_of_beauty': 'Appreciation of Beauty',
  'gratitude': 'Gratitude',
  'hope': 'Hope',
  'humor': 'Humor',
  'spirituality': 'Spirituality',
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('en')
  const [strengths, setStrengths] = useState<string[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    setEmail(user.email || '')

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, preferred_language, created_at')
      .eq('id', user.id)
      .single()

    if (profile) {
      setFullName(profile.full_name || '')
      setLanguage(profile.preferred_language || 'en')
    }

    // Load strengths
    const { data: strengthsData } = await supabase
      .from('user_strengths')
      .select('top_strengths')
      .eq('user_id', user.id)
      .single()

    if (strengthsData?.top_strengths) {
      setStrengths(strengthsData.top_strengths)
    }

    // Load stats
    const { count: sessionsCount } = await supabase
      .from('coaching_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: interventionsCount } = await supabase
      .from('intervention_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: goalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .single()

    setStats({
      totalSessions: sessionsCount || 0,
      totalInterventions: interventionsCount || 0,
      totalJournalEntries: journalCount || 0,
      totalGoals: goalsCount || 0,
      currentStreak: streakData?.current_streak || 0,
      longestStreak: streakData?.longest_streak || 0,
      memberSince: profile?.created_at || user.created_at
    })

    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        preferred_language: language,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Delete all user data (cascades should handle most)
    await supabase.from('coaching_sessions').delete().eq('user_id', user.id)
    await supabase.from('intervention_completions').delete().eq('user_id', user.id)
    await supabase.from('journal_entries').delete().eq('user_id', user.id)
    await supabase.from('goals').delete().eq('user_id', user.id)
    await supabase.from('user_strengths').delete().eq('user_id', user.id)
    await supabase.from('user_streaks').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
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
          <p className="text-[#6b6b6b]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            Profile
          </h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl bg-[#f8f6f3] text-[#6b6b6b] cursor-not-allowed"
              />
              <p className="text-xs text-[#6b6b6b] mt-1">Email cannot be changed</p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all bg-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                'Saving...'
              ) : saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Strengths Section */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Character Strengths
            </h2>
            <Link href="/strengths" className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
              {strengths.length > 0 ? 'Edit' : 'Set up'}
            </Link>
          </div>
          
          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strengths.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-[#fce7f3] text-[#db2777] rounded-full text-sm">
                  {VIA_STRENGTHS_MAP[s] || s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#6b6b6b] text-sm">
              No strengths selected yet. Set up your VIA Character Strengths to personalize coaching.
            </p>
          )}
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <h2 className="font-semibold text-[#2d2d2d] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
              Your Stats
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.totalSessions}</p>
                <p className="text-sm text-[#6b6b6b]">Coaching Sessions</p>
              </div>
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.totalInterventions}</p>
                <p className="text-sm text-[#6b6b6b]">Interventions</p>
              </div>
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.totalJournalEntries}</p>
                <p className="text-sm text-[#6b6b6b]">Journal Entries</p>
              </div>
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.totalGoals}</p>
                <p className="text-sm text-[#6b6b6b]">Goals</p>
              </div>
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.currentStreak}</p>
                <p className="text-sm text-[#6b6b6b]">Current Streak</p>
              </div>
              <div className="p-4 bg-[#f8f6f3] rounded-xl text-center">
                <p className="text-2xl font-bold text-[#2d2d2d]">{stats.longestStreak}</p>
                <p className="text-sm text-[#6b6b6b]">Longest Streak</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e8e4df] text-center">
              <p className="text-sm text-[#6b6b6b]">
                Member since {formatDate(stats.memberSince)}
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Quick Links
          </h2>
          
          <div className="space-y-2">
            <Link href="/progress" className="flex items-center justify-between p-3 hover:bg-[#f8f6f3] rounded-xl transition">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <span className="text-[#2d2d2d]">View Progress</span>
              </div>
              <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
            <Link href="/journal" className="flex items-center justify-between p-3 hover:bg-[#f8f6f3] rounded-xl transition">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="text-[#2d2d2d]">Journal</span>
              </div>
              <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
            <Link href="/goals" className="flex items-center justify-between p-3 hover:bg-[#f8f6f3] rounded-xl transition">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
                <span className="text-[#2d2d2d]">Goals</span>
              </div>
              <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            About
          </h2>
          <div className="space-y-3 text-sm text-[#6b6b6b]">
            <p>
              <strong className="text-[#2d2d2d]">Positive Health Coach</strong> is powered by evidence-based micro-interventions from positive psychology research.
            </p>
            <p>
              Based on Burke et al. (2023) and the 2025 ICF Core Competencies for professional coaching.
            </p>
            <p>
              This app is not a substitute for professional mental health care. If you're experiencing a crisis, please contact a mental health professional or emergency services.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="font-semibold text-red-600 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Danger Zone
          </h2>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#6b6b6b]">
                Are you sure? This will permanently delete all your data including coaching sessions, journal entries, goals, and progress. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-[#e8e4df] text-[#6b6b6b] rounded-xl font-medium hover:bg-[#f8f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Version */}
        <div className="mt-8 text-center text-sm text-[#6b6b6b]">
          <p>Version 1.0.0</p>
        </div>
      </main>
    </div>
  )
}