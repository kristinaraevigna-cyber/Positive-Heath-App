'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const VIA_STRENGTHS = [
  // Wisdom
  { id: 'creativity', name: 'Creativity', virtue: 'Wisdom', description: 'Thinking of new ways to do things' },
  { id: 'curiosity', name: 'Curiosity', virtue: 'Wisdom', description: 'Taking an interest in all experiences' },
  { id: 'judgment', name: 'Judgment', virtue: 'Wisdom', description: 'Thinking things through and examining from all sides' },
  { id: 'love_of_learning', name: 'Love of Learning', virtue: 'Wisdom', description: 'Mastering new skills and knowledge' },
  { id: 'perspective', name: 'Perspective', virtue: 'Wisdom', description: 'Being able to provide wise counsel to others' },
  
  // Courage
  { id: 'bravery', name: 'Bravery', virtue: 'Courage', description: 'Not shrinking from challenge or pain' },
  { id: 'perseverance', name: 'Perseverance', virtue: 'Courage', description: 'Finishing what you start' },
  { id: 'honesty', name: 'Honesty', virtue: 'Courage', description: 'Speaking the truth and being genuine' },
  { id: 'zest', name: 'Zest', virtue: 'Courage', description: 'Approaching life with excitement and energy' },
  
  // Humanity
  { id: 'love', name: 'Love', virtue: 'Humanity', description: 'Valuing close relationships with others' },
  { id: 'kindness', name: 'Kindness', virtue: 'Humanity', description: 'Doing favors and good deeds for others' },
  { id: 'social_intelligence', name: 'Social Intelligence', virtue: 'Humanity', description: 'Being aware of the motives and feelings of others' },
  
  // Justice
  { id: 'teamwork', name: 'Teamwork', virtue: 'Justice', description: 'Working well as a member of a group' },
  { id: 'fairness', name: 'Fairness', virtue: 'Justice', description: 'Treating all people the same' },
  { id: 'leadership', name: 'Leadership', virtue: 'Justice', description: 'Organizing group activities and seeing they happen' },
  
  // Temperance
  { id: 'forgiveness', name: 'Forgiveness', virtue: 'Temperance', description: 'Forgiving those who have done wrong' },
  { id: 'humility', name: 'Humility', virtue: 'Temperance', description: 'Letting accomplishments speak for themselves' },
  { id: 'prudence', name: 'Prudence', virtue: 'Temperance', description: 'Being careful about choices; not taking undue risks' },
  { id: 'self_regulation', name: 'Self-Regulation', virtue: 'Temperance', description: 'Regulating what you feel and do' },
  
  // Transcendence
  { id: 'appreciation_of_beauty', name: 'Appreciation of Beauty', virtue: 'Transcendence', description: 'Noticing beauty and excellence in all domains' },
  { id: 'gratitude', name: 'Gratitude', virtue: 'Transcendence', description: 'Being aware of and thankful for good things' },
  { id: 'hope', name: 'Hope', virtue: 'Transcendence', description: 'Expecting the best and working to achieve it' },
  { id: 'humor', name: 'Humor', virtue: 'Transcendence', description: 'Liking to laugh and bringing smiles to others' },
  { id: 'spirituality', name: 'Spirituality', virtue: 'Transcendence', description: 'Having beliefs about higher purpose and meaning' },
]

const VIRTUES = ['Wisdom', 'Courage', 'Humanity', 'Justice', 'Temperance', 'Transcendence']

const VIRTUE_COLORS: { [key: string]: string } = {
  'Wisdom': 'bg-[#f5f3ff] text-[#7c3aed] border-[#7c3aed]',
  'Courage': 'bg-[#fef3eb] text-[#e07a3a] border-[#e07a3a]',
  'Humanity': 'bg-[#fee2e2] text-[#ee5a5a] border-[#ee5a5a]',
  'Justice': 'bg-[#e0f2fe] text-[#0284c7] border-[#0284c7]',
  'Temperance': 'bg-[#e3e7e3] text-[#5f7360] border-[#5f7360]',
  'Transcendence': 'bg-[#fce7f3] text-[#db2777] border-[#db2777]',
}

export default function StrengthsPage() {
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([])
  const [savedStrengths, setSavedStrengths] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadStrengths()
  }, [])

  const loadStrengths = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('user_strengths')
      .select('top_strengths')
      .eq('user_id', user.id)
      .single()

    if (data?.top_strengths) {
      setSavedStrengths(data.top_strengths)
      setSelectedStrengths(data.top_strengths)
    } else {
      setIsEditing(true)
    }
    
    setLoading(false)
  }

  const toggleStrength = (strengthId: string) => {
    if (selectedStrengths.includes(strengthId)) {
      setSelectedStrengths(selectedStrengths.filter(s => s !== strengthId))
    } else if (selectedStrengths.length < 5) {
      setSelectedStrengths([...selectedStrengths, strengthId])
    }
  }

  const saveStrengths = async () => {
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('user_strengths')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase
        .from('user_strengths')
        .update({ 
          top_strengths: selectedStrengths,
          assessment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('user_strengths')
        .insert({
          user_id: user.id,
          top_strengths: selectedStrengths,
          assessment_date: new Date().toISOString()
        })
    }

    setSavedStrengths(selectedStrengths)
    setIsEditing(false)
    setSaving(false)
  }

  const getStrengthById = (id: string) => VIA_STRENGTHS.find(s => s.id === id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-[#6b6b6b]">Loading strengths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#db2777]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Character Strengths</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-6 h-6 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[#2d2d2d] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                VIA Character Strengths
              </h2>
              <p className="text-sm text-[#6b6b6b] mb-3">
                The VIA Classification identifies 24 character strengths organized under 6 virtues. 
                Knowing your signature strengths helps your coach personalize guidance.
              </p>
              <a 
                href="https://www.viacharacter.org/survey/account/register" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#7c3aed] font-medium hover:underline"
              >
                Take the free VIA Survey
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Saved Strengths View */}
        {!isEditing && savedStrengths.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                Your Signature Strengths
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-[#ee5a5a] font-medium hover:text-[#d94848] transition"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {savedStrengths.map((strengthId, index) => {
                const strength = getStrengthById(strengthId)
                if (!strength) return null
                return (
                  <div 
                    key={strengthId}
                    className="flex items-center gap-4 p-4 bg-[#f8f6f3] rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2d2d2d]">{strength.name}</p>
                      <p className="text-sm text-[#6b6b6b]">{strength.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${VIRTUE_COLORS[strength.virtue]}`}>
                      {strength.virtue}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Coach CTA */}
            <div className="mt-6 pt-6 border-t border-[#e8e4df] text-center">
              <p className="text-sm text-[#6b6b6b] mb-3">Your coach will use these strengths to personalize your sessions</p>
              <Link
                href="/coach"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5f7360] to-[#4a5b4b] text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                Start Coaching Session
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Selection Mode */}
        {isEditing && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                Select Your Top 5 Strengths
              </h2>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                selectedStrengths.length === 5 
                  ? 'bg-[#e3e7e3] text-[#5f7360]' 
                  : 'bg-[#f8f6f3] text-[#6b6b6b]'
              }`}>
                {selectedStrengths.length}/5 selected
              </span>
            </div>

            {/* Strengths by Virtue */}
            <div className="space-y-6 mb-8">
              {VIRTUES.map((virtue) => (
                <div key={virtue} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                  <h3 className={`font-medium mb-4 flex items-center gap-2`}>
                    <span className={`w-3 h-3 rounded-full ${VIRTUE_COLORS[virtue].split(' ')[0]}`}></span>
                    {virtue}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {VIA_STRENGTHS.filter(s => s.virtue === virtue).map((strength) => {
                      const isSelected = selectedStrengths.includes(strength.id)
                      const isDisabled = !isSelected && selectedStrengths.length >= 5
                      
                      return (
                        <button
                          key={strength.id}
                          onClick={() => toggleStrength(strength.id)}
                          disabled={isDisabled}
                          className={`p-3 rounded-xl border-2 text-left transition ${
                            isSelected 
                              ? `${VIRTUE_COLORS[virtue]} border-current` 
                              : isDisabled
                                ? 'border-[#e8e4df] opacity-50 cursor-not-allowed'
                                : 'border-[#e8e4df] hover:border-[#d4c4b5]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected 
                                ? 'bg-current border-current' 
                                : 'border-[#d4c4b5]'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${isSelected ? '' : 'text-[#2d2d2d]'}`}>
                                {strength.name}
                              </p>
                              <p className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'text-[#6b6b6b]'}`}>
                                {strength.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-4 flex gap-3">
              {savedStrengths.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedStrengths(savedStrengths)
                    setIsEditing(false)
                  }}
                  className="flex-1 py-4 bg-white border border-[#e8e4df] rounded-xl text-[#6b6b6b] font-medium hover:bg-[#f8f6f3] transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={saveStrengths}
                disabled={selectedStrengths.length !== 5 || saving}
                className="flex-1 py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save My Strengths'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}