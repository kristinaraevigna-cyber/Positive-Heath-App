'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, Goal } from '@/lib/supabase'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    target_date: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
  })
  const [saving, setSaving] = useState(false)
  const [showSmart, setShowSmart] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const categories = [
    { value: 'movement', label: 'Movement', color: 'bg-[#fee2e2] text-[#ee5a5a]' },
    { value: 'nutrition', label: 'Nutrition', color: 'bg-[#e3e7e3] text-[#5f7360]' },
    { value: 'sleep', label: 'Sleep', color: 'bg-[#f5f3ff] text-[#7c3aed]' },
    { value: 'stress', label: 'Stress', color: 'bg-[#fef3eb] text-[#e07a3a]' },
    { value: 'connection', label: 'Connection', color: 'bg-[#fce7f3] text-[#db2777]' },
    { value: 'substance', label: 'Substances', color: 'bg-[#f5f0eb] text-[#7a6150]' },
  ]

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'movement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        )
      case 'nutrition':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )
      case 'sleep':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )
      case 'stress':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )
      case 'connection':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        )
      case 'substance':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
        )
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setGoals(data || [])
    setLoading(false)
  }

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Build SMART description
    let smartDescription = newGoal.description || ''
    if (showSmart && (newGoal.specific || newGoal.measurable || newGoal.achievable || newGoal.relevant)) {
      const smartParts = []
      if (newGoal.specific) smartParts.push(`Specific: ${newGoal.specific}`)
      if (newGoal.measurable) smartParts.push(`Measurable: ${newGoal.measurable}`)
      if (newGoal.achievable) smartParts.push(`Achievable: ${newGoal.achievable}`)
      if (newGoal.relevant) smartParts.push(`Relevant: ${newGoal.relevant}`)
      smartDescription = smartParts.join('\n')
    }

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: smartDescription || null,
      category: newGoal.category || null,
      target_date: newGoal.target_date || null
    })

    if (!error) {
      setNewGoal({ title: '', description: '', category: '', target_date: '', specific: '', measurable: '', achievable: '', relevant: '' })
      setShowForm(false)
      setShowSmart(false)
      loadGoals()
    }
    setSaving(false)
  }

  const updateGoalStatus = async (goalId: string, status: string) => {
    await supabase.from('goals').update({ status }).eq('id', goalId)
    loadGoals()
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
          <p className="text-[#6b6b6b]">Loading goals...</p>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const pausedGoals = goals.filter(g => g.status === 'paused')

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
            <div className="w-8 h-8 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#7a6150]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Your Goals</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:shadow-lg transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Goal
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* New Goal Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <h2 className="font-semibold text-[#2d2d2d] mb-5 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Create a New Goal</h2>
            <form onSubmit={createGoal} className="space-y-5">
              {/* Goal Title */}
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                  What do you want to achieve?
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all"
                  placeholder="e.g., Walk 10,000 steps daily"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, category: cat.value })}
                      className={`p-3 rounded-xl border-2 text-sm flex flex-col items-center gap-2 transition ${
                        newGoal.category === cat.value
                          ? 'border-[#ee5a5a] bg-[#fef2f2]'
                          : 'border-[#e8e4df] hover:border-[#d4c4b5]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                        {getCategoryIcon(cat.value)}
                      </div>
                      <span className="text-[#2d2d2d]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SMART Framework Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSmart(!showSmart)}
                  className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#2d2d2d] transition"
                >
                  <svg className={`w-4 h-4 transition-transform ${showSmart ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  Use SMART Goal Framework
                </button>
              </div>

              {/* SMART Fields */}
              {showSmart && (
                <div className="space-y-4 p-4 bg-[#f8f6f3] rounded-xl">
                  <p className="text-xs text-[#6b6b6b] mb-3">Make your goal Specific, Measurable, Achievable, Relevant, and Time-bound</p>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#5f7360] mb-1 uppercase tracking-wide">
                      Specific — What exactly will you do?
                    </label>
                    <input
                      type="text"
                      value={newGoal.specific}
                      onChange={(e) => setNewGoal({ ...newGoal, specific: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:ring-0 focus:border-[#5f7360]"
                      placeholder="e.g., Walk during lunch break"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#5f7360] mb-1 uppercase tracking-wide">
                      Measurable — How will you track progress?
                    </label>
                    <input
                      type="text"
                      value={newGoal.measurable}
                      onChange={(e) => setNewGoal({ ...newGoal, measurable: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:ring-0 focus:border-[#5f7360]"
                      placeholder="e.g., Track steps with phone"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#5f7360] mb-1 uppercase tracking-wide">
                      Achievable — Is this realistic for you?
                    </label>
                    <input
                      type="text"
                      value={newGoal.achievable}
                      onChange={(e) => setNewGoal({ ...newGoal, achievable: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:ring-0 focus:border-[#5f7360]"
                      placeholder="e.g., Start with 5,000 steps, increase weekly"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#5f7360] mb-1 uppercase tracking-wide">
                      Relevant — Why does this matter to you?
                    </label>
                    <input
                      type="text"
                      value={newGoal.relevant}
                      onChange={(e) => setNewGoal({ ...newGoal, relevant: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:ring-0 focus:border-[#5f7360]"
                      placeholder="e.g., Improve energy and reduce stress"
                    />
                  </div>
                </div>
              )}

              {/* Simple Description (if not using SMART) */}
              {!showSmart && (
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                    Why is this important? (optional)
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all"
                    rows={2}
                    placeholder="Your motivation..."
                  />
                </div>
              )}

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                  Target Date (Time-bound)
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setShowSmart(false) }}
                  className="flex-1 py-3 border border-[#e8e4df] rounded-xl text-[#6b6b6b] hover:bg-[#f8f6f3] transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newGoal.title}
                  className="flex-1 py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 font-medium"
                >
                  {saving ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="font-semibold text-[#2d2d2d] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Active Goals
            <span className="text-sm font-normal text-[#6b6b6b]">({activeGoals.length})</span>
          </h2>
          
          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-10 text-center">
              <div className="w-16 h-16 bg-[#f5f0eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] mb-4">No active goals yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-[#ee5a5a] font-medium hover:text-[#d94848] transition"
              >
                Create your first goal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const cat = categories.find(c => c.value === goal.category)
                return (
                  <div key={goal.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat?.color || 'bg-[#f5f0eb] text-[#7a6150]'}`}>
                        {getCategoryIcon(goal.category || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#2d2d2d]">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-[#6b6b6b] mt-1 line-clamp-2">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          {goal.target_date && (
                            <span className="text-xs text-[#6b6b6b] flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {goal.category && (
                            <span className="text-xs text-[#6b6b6b] capitalize">{goal.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateGoalStatus(goal.id, 'completed')}
                          className="p-2 text-[#5f7360] hover:bg-[#e3e7e3] rounded-xl transition"
                          title="Mark complete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => updateGoalStatus(goal.id, 'paused')}
                          className="p-2 text-[#6b6b6b] hover:bg-[#f8f6f3] rounded-xl transition"
                          title="Pause"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Paused Goals */}
        {pausedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-[#2d2d2d] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Paused
              <span className="text-sm font-normal text-[#6b6b6b]">({pausedGoals.length})</span>
            </h2>
            <div className="space-y-3">
              {pausedGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f8f6f3] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                      </svg>
                    </div>
                    <span className="text-[#6b6b6b] flex-1">{goal.title}</span>
                    <button
                      onClick={() => updateGoalStatus(goal.id, 'active')}
                      className="text-xs text-[#ee5a5a] hover:text-[#d94848] font-medium"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="font-semibold text-[#2d2d2d] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Completed
              <span className="text-sm font-normal text-[#6b6b6b]">({completedGoals.length})</span>
            </h2>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#e3e7e3] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[#6b6b6b] line-through">{goal.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to Coach */}
        <div className="mt-10 p-6 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-2xl text-center">
          <p className="text-[#7a6150] mb-3">Need help setting meaningful goals?</p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#7a6150] rounded-xl font-medium hover:shadow-md transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Talk to Your Coach
          </Link>
        </div>
      </main>
    </div>
  )
}