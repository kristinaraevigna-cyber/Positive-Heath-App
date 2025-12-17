'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type JournalEntry = {
  id: string
  user_id: string
  entry_type: string
  content: string
  mood_before?: number
  mood_after?: number
  created_at: string
}

const ENTRY_TYPES = [
  { 
    value: 'gratitude', 
    label: 'Gratitude', 
    prompt: 'What are 3 things you\'re grateful for today?',
    color: 'bg-[#e3e7e3] text-[#5f7360]',
    bgLight: 'bg-[#f0f7f1]'
  },
  { 
    value: 'reflection', 
    label: 'Reflection', 
    prompt: 'What went well today? What did you learn?',
    color: 'bg-[#f5f3ff] text-[#7c3aed]',
    bgLight: 'bg-[#faf8ff]'
  },
  { 
    value: 'freewrite', 
    label: 'Free Write', 
    prompt: 'Write freely about whatever is on your mind...',
    color: 'bg-[#fef3eb] text-[#e07a3a]',
    bgLight: 'bg-[#fffaf6]'
  },
  { 
    value: 'wins', 
    label: 'Wins', 
    prompt: 'What\'s a small or big win you had recently?',
    color: 'bg-[#fee2e2] text-[#ee5a5a]',
    bgLight: 'bg-[#fef7f7]'
  },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setEntries(data || [])
    setLoading(false)
  }

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !content.trim()) return
    
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      entry_type: selectedType,
      content: content.trim(),
    })

    if (!error) {
      setContent('')
      setSelectedType(null)
      setShowForm(false)
      loadEntries()
    }
    setSaving(false)
  }

  const getEntryTypeConfig = (type: string) => {
    return ENTRY_TYPES.find(t => t.value === type) || ENTRY_TYPES[2]
  }

  const getEntryIcon = (type: string) => {
    switch(type) {
      case 'gratitude':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )
      case 'reflection':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )
      case 'freewrite':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        )
      case 'wins':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  // Group entries by date
  const groupedEntries = entries.reduce((groups: { [key: string]: JournalEntry[] }, entry) => {
    const date = formatDate(entry.created_at)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-[#6b6b6b]">Loading journal...</p>
        </div>
      </div>
    )
  }

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
            <div className="w-8 h-8 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Journal</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:shadow-lg transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Entry
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* New Entry Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            {!selectedType ? (
              <>
                <h2 className="font-semibold text-[#2d2d2d] mb-5 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                  What would you like to write about?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {ENTRY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-5 rounded-xl border-2 border-[#e8e4df] hover:border-[#d4c4b5] transition text-left ${type.bgLight}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${type.color}`}>
                        {getEntryIcon(type.value)}
                      </div>
                      <h3 className="font-semibold text-[#2d2d2d] mb-1">{type.label}</h3>
                      <p className="text-xs text-[#6b6b6b]">{type.prompt}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-4 w-full py-2 text-[#6b6b6b] hover:text-[#2d2d2d] transition text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <form onSubmit={createEntry}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getEntryTypeConfig(selectedType).color}`}>
                    {getEntryIcon(selectedType)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {getEntryTypeConfig(selectedType).label}
                    </h2>
                    <p className="text-sm text-[#6b6b6b]">{getEntryTypeConfig(selectedType).prompt}</p>
                  </div>
                </div>
                
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] focus:shadow-[0_0_0_3px_rgba(238,90,90,0.1)] transition-all resize-none"
                  rows={6}
                  placeholder="Start writing..."
                  autoFocus
                  required
                />

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setSelectedType(null); setContent('') }}
                    className="flex-1 py-3 border border-[#e8e4df] rounded-xl text-[#6b6b6b] hover:bg-[#f8f6f3] transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !content.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Quick Entry Buttons (when form is hidden) */}
        {!showForm && entries.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {ENTRY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => { setShowForm(true); setSelectedType(type.value) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e8e4df] hover:border-[#d4c4b5] transition whitespace-nowrap ${type.bgLight}`}
              >
                <span className={type.color.split(' ')[1]}>{getEntryIcon(type.value)}</span>
                <span className="text-sm text-[#2d2d2d]">{type.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Entries */}
        {entries.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-10 text-center">
            <div className="w-16 h-16 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Start Your Journal
            </h3>
            <p className="text-[#6b6b6b] mb-5 text-sm">
              Capture gratitude, reflections, and wins
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-[#6b6b6b] mb-3 sticky top-[73px] bg-[#f8f6f3] py-2">
                  {date}
                </h3>
                <div className="space-y-3">
                  {dateEntries.map((entry) => {
                    const typeConfig = getEntryTypeConfig(entry.entry_type)
                    const isExpanded = expandedEntry === entry.id
                    
                    return (
                      <div 
                        key={entry.id} 
                        className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden hover:shadow-md transition cursor-pointer"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                              {getEntryIcon(entry.entry_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#2d2d2d] text-sm">{typeConfig.label}</span>
                                <span className="text-xs text-[#6b6b6b]">{formatTime(entry.created_at)}</span>
                              </div>
                              <p className={`text-[#6b6b6b] text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {entry.content}
                              </p>
                            </div>
                            <svg 
                              className={`w-5 h-5 text-[#6b6b6b] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              strokeWidth={1.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inspiration Banner */}
        {entries.length > 0 && (
          <div className="mt-10 p-6 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-2xl text-center">
            <p className="text-[#5f7360] mb-3">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} written
            </p>
            <p className="text-xs text-[#5f7360]/70">
              Journaling builds self-awareness and positive wellbeing
            </p>
          </div>
        )}
      </main>
    </div>
  )
}