'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  target_date: string
  status: string
  progress: number
  created_at: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'health',
    target_date: '',
  })
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const CATEGORIES = [
    { id: 'health', name: 'Health', color: 'bg-[#e3e7e3] text-[#5f7360]' },
    { id: 'relationships', name: 'Relationships', color: 'bg-[#fce7f3] text-[#db2777]' },
    { id: 'career', name: 'Career', color: 'bg-[#e0f2fe] text-[#0284c7]' },
    { id: 'personal', name: 'Personal Growth', color: 'bg-[#f5f3ff] text-[#7c3aed]' },
    { id: 'mindfulness', name: 'Mindfulness', color: 'bg-[#fef3eb] text-[#e07a3a]' },
    { id: 'other', name: 'Other', color: 'bg-[#f8f6f3] text-[#6b6b6b]' },
  ]

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/study-info')
      return
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading goals:', error)
    } else {
      setGoals(data || [])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingGoal) {
      const { error } = await supabase
        .from('goals')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_date: formData.target_date || null,
        })
        .eq('id', editingGoal.id)

      if (error) {
        console.error('Error updating goal:', error)
        alert('Failed to update goal')
      }
    } else {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_date: formData.target_date || null,
          status: 'active',
          progress: 0,
        })

      if (error) {
        console.error('Error creating goal:', error)
        alert('Failed to create goal')
      }
    }

    setSaving(false)
    setShowForm(false)
    setEditingGoal(null)
    setFormData({ title: '', description: '', category: 'health', target_date: '' })
    loadGoals()
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'health',
      target_date: goal.target_date || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal')
    } else {
      loadGoals()
    }
  }

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    const { error } = await supabase
      .from('goals')
      .update({ 
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active'
      })
      .eq('id', goalId)

    if (error) {
      console.error('Error updating progress:', error)
    } else {
      loadGoals()
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: string) => {
    const { error } = await supabase
      .from('goals')
      .update({ 
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : undefined
      })
      .eq('id', goalId)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      loadGoals()
    }
  }

  const getCategoryStyle = (category: string) => {
    return CATEGORIES.find(c => c.id === category)?.color || 'bg-[#f8f6f3] text-[#6b6b6b]'
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

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

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Goals</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null)
              setFormData({ title: '', description: '', category: 'health', target_date: '' })
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Goal
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {goals.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#a68b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Set Your First Goal
            </h2>
            <p className="text-[#6b6b6b] mb-6 max-w-md mx-auto">
              Goals help you focus your energy and track your progress. Start with something meaningful to you.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Goal
            </button>
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Active Goals ({activeGoals.length})
                </h2>
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    return (
                      <div key={goal.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryStyle(goal.category)}`}>
                                {CATEGORIES.find(c => c.id === goal.category)?.name || goal.category}
                              </span>
                              {goal.target_date && (
                                <span className="text-xs text-[#6b6b6b]">
                                  Due: {new Date(goal.target_date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-[#2d2d2d] mb-1">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-[#6b6b6b]">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(goal)}
                              className="p-2 text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f8f6f3] rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="p-2 text-[#6b6b6b] hover:text-[#ee5a5a] hover:bg-[#fee2e2] rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#6b6b6b]">Progress</span>
                            <span className="text-sm font-medium text-[#2d2d2d]">{goal.progress}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#e8e4df] rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#5f7360] to-[#7a9a7c] h-2 rounded-full transition-all"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                                className="p-1 text-[#6b6b6b] hover:bg-[#f8f6f3] rounded transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                                className="p-1 text-[#6b6b6b] hover:bg-[#f8f6f3] rounded transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {goal.progress >= 100 && (
                          <button
                            onClick={() => handleStatusChange(goal.id, 'completed')}
                            className="mt-4 w-full py-2 bg-[#e3e7e3] text-[#5f7360] rounded-xl font-medium hover:bg-[#d4dbd4] transition"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Completed ({completedGoals.length})
                </h2>
                <div className="space-y-4">
                  {completedGoals.map((goal) => {
                    return (
                      <div key={goal.id} className="bg-white/60 rounded-2xl border border-[#e8e4df] p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-[#e3e7e3] text-[#5f7360]">
                                Completed
                              </span>
                            </div>
                            <h3 className="font-semibold text-[#6b6b6b] line-through">{goal.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(goal.id, 'active')}
                              className="text-xs text-[#ee5a5a] hover:text-[#d94848] transition"
                            >
                              Reopen
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="p-2 text-[#6b6b6b] hover:text-[#ee5a5a] hover:bg-[#fee2e2] rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
                }}
                className="p-2 text-[#6b6b6b] hover:bg-[#f8f6f3] rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Exercise 3 times per week"
                  required
                  className="w-full px-4 py-3 border border-[#e8e4df] rounded-xl focus:outline-none focus:border-[#ee5a5a] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details about your goal..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[#e8e4df] rounded-xl focus:outline-none focus:border-[#ee5a5a] transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                          formData.category === cat.id
                            ? 'ring-2 ring-[#ee5a5a] ' + cat.color
                            : cat.color + ' opacity-60 hover:opacity-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e8e4df] rounded-xl focus:outline-none focus:border-[#ee5a5a] transition"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingGoal(null)
                  }}
                  className="flex-1 py-3 border border-[#e8e4df] text-[#6b6b6b] rounded-xl font-medium hover:bg-[#f8f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title}
                  className="flex-1 py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
