'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Intervention = {
  id: string
  name: string
  description: string
  category: string
  duration_minutes: number
  difficulty: string
  benefits: string[]
  steps: string[]
  pro_tip: string
  research_source: string
}

type Step = 'mood-before' | 'doing' | 'mood-after' | 'complete'

const MOOD_OPTIONS = [
  { value: 1, label: 'Very Low', color: 'bg-red-100 text-red-600 border-red-200' },
  { value: 2, label: 'Low', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { value: 3, label: 'Somewhat Low', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { value: 4, label: 'Below Average', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { value: 5, label: 'Neutral', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 6, label: 'Above Average', color: 'bg-lime-100 text-lime-600 border-lime-200' },
  { value: 7, label: 'Good', color: 'bg-green-100 text-green-600 border-green-200' },
  { value: 8, label: 'Very Good', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { value: 9, label: 'Great', color: 'bg-teal-100 text-teal-600 border-teal-200' },
  { value: 10, label: 'Excellent', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
]

export default function DoInterventionPage() {
  const [intervention, setIntervention] = useState<Intervention | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('mood-before')
  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [moodChange, setMoodChange] = useState<number>(0)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadIntervention()
  }, [params.id])

  const loadIntervention = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('interventions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (data) {
      setIntervention(data)
    } else {
      router.push('/interventions')
    }
    setLoading(false)
  }

  const saveCompletion = async () => {
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !intervention) return

    // Save completion
    await supabase.from('intervention_completions').insert({
      user_id: user.id,
      intervention_id: intervention.id,
      mood_before: moodBefore,
      mood_after: moodAfter,
    })

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingStreak) {
      const lastDate = existingStreak.last_activity_date
      const lastActivityDate = lastDate ? new Date(lastDate) : null
      const todayDate = new Date(today)
      
      let newStreak = existingStreak.current_streak || 0
      
      if (lastActivityDate) {
        const diffDays = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          // Same day, no change to streak
        } else if (diffDays === 1) {
          // Consecutive day
          newStreak += 1
        } else {
          // Streak broken
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, existingStreak.longest_streak || 0),
          total_interventions_completed: (existingStreak.total_interventions_completed || 0) + 1,
          last_activity_date: today,
        })
        .eq('user_id', user.id)
    } else {
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        total_interventions_completed: 1,
        last_activity_date: today,
      })
    }

    // Calculate mood change
    if (moodBefore && moodAfter) {
      setMoodChange(moodAfter - moodBefore)
    }

    setSaving(false)
    setStep('complete')
  }

  const handleMoodBeforeSubmit = () => {
    if (moodBefore) {
      setStep('doing')
    }
  }

  const handleMoodAfterSubmit = () => {
    if (moodAfter) {
      saveCompletion()
    }
  }

  const nextStep = () => {
    if (intervention && currentStepIndex < intervention.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      setStep('mood-after')
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
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
          <p className="text-[#6b6b6b]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!intervention) return null

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/interventions" 
            className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-[#2d2d2d] text-sm truncate">{intervention.name}</h1>
            <p className="text-xs text-[#6b6b6b]">{intervention.duration_minutes} min</p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full ${step === 'mood-before' || step === 'doing' || step === 'mood-after' || step === 'complete' ? 'bg-[#ee5a5a]' : 'bg-[#e8e4df]'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 'doing' || step === 'mood-after' || step === 'complete' ? 'bg-[#ee5a5a]' : 'bg-[#e8e4df]'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 'mood-after' || step === 'complete' ? 'bg-[#ee5a5a]' : 'bg-[#e8e4df]'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 'complete' ? 'bg-[#ee5a5a]' : 'bg-[#e8e4df]'}`} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* MOOD BEFORE */}
        {step === 'mood-before' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <h2 className="text-2xl text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              How are you feeling?
            </h2>
            <p className="text-[#6b6b6b] mb-8">Before we start, rate your current mood</p>

            <div className="grid grid-cols-5 gap-2 mb-8">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setMoodBefore(mood.value)}
                  className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    moodBefore === mood.value 
                      ? 'border-[#ee5a5a] bg-[#fef2f2]' 
                      : 'border-[#e8e4df] hover:border-[#d4c4b5]'
                  }`}
                >
                  <span className="text-2xl font-bold text-[#2d2d2d]">{mood.value}</span>
                  <span className="text-xs text-[#6b6b6b] hidden sm:block">{mood.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleMoodBeforeSubmit}
              disabled={!moodBefore}
              className="w-full py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              Begin Intervention
            </button>
          </div>
        )}

        {/* DOING INTERVENTION */}
        {step === 'doing' && intervention.steps && (
          <div>
            <div className="text-center mb-8">
              <span className="text-sm text-[#6b6b6b]">
                Step {currentStepIndex + 1} of {intervention.steps.length}
              </span>
              <div className="w-full bg-[#e8e4df] rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-[#ee5a5a] to-[#d94848] h-1.5 rounded-full transition-all"
                  style={{ width: `${((currentStepIndex + 1) / intervention.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-8 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-[#5f7360]">{currentStepIndex + 1}</span>
              </div>
              <p className="text-lg text-[#2d2d2d] leading-relaxed">
                {intervention.steps[currentStepIndex]}
              </p>
            </div>

            {/* Pro tip on last step */}
            {currentStepIndex === intervention.steps.length - 1 && intervention.pro_tip && (
              <div className="bg-[#fef3eb] rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-[#e07a3a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#e07a3a] mb-1">Pro Tip</p>
                    <p className="text-sm text-[#7a6150]">{intervention.pro_tip}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-4 border border-[#e8e4df] rounded-xl text-[#6b6b6b] hover:bg-[#f8f6f3] transition font-medium"
                >
                  Previous
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex-1 py-4 bg-gradient-to-r from-[#5f7360] to-[#4a5b4b] text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                {currentStepIndex === intervention.steps.length - 1 ? 'Finish' : 'Next Step'}
              </button>
            </div>
          </div>
        )}

        {/* MOOD AFTER */}
        {step === 'mood-after' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Well done!
            </h2>
            <p className="text-[#6b6b6b] mb-8">How are you feeling now?</p>

            <div className="grid grid-cols-5 gap-2 mb-8">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setMoodAfter(mood.value)}
                  className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    moodAfter === mood.value 
                      ? 'border-[#5f7360] bg-[#f0f7f1]' 
                      : 'border-[#e8e4df] hover:border-[#d4c4b5]'
                  }`}
                >
                  <span className="text-2xl font-bold text-[#2d2d2d]">{mood.value}</span>
                  <span className="text-xs text-[#6b6b6b] hidden sm:block">{mood.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleMoodAfterSubmit}
              disabled={!moodAfter || saving}
              className="w-full py-4 bg-gradient-to-r from-[#5f7360] to-[#4a5b4b] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Complete'}
            </button>
          </div>
        )}

        {/* COMPLETE */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5f7360] to-[#4a5b4b] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Intervention Complete!
            </h2>
            <p className="text-[#6b6b6b] mb-8">Great work taking care of your wellbeing</p>

            {/* Mood Change */}
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
              <p className="text-sm text-[#6b6b6b] mb-3">Your Mood</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#2d2d2d]">{moodBefore}</p>
                  <p className="text-xs text-[#6b6b6b]">Before</p>
                </div>
                <svg className="w-6 h-6 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#2d2d2d]">{moodAfter}</p>
                  <p className="text-xs text-[#6b6b6b]">After</p>
                </div>
                {moodChange !== 0 && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    moodChange > 0 
                      ? 'bg-[#e3e7e3] text-[#5f7360]' 
                      : moodChange < 0 
                        ? 'bg-[#fee2e2] text-[#ee5a5a]'
                        : 'bg-[#f8f6f3] text-[#6b6b6b]'
                  }`}>
                    {moodChange > 0 ? '+' : ''}{moodChange}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/interventions"
                className="flex-1 py-4 border border-[#e8e4df] rounded-xl text-[#6b6b6b] hover:bg-[#f8f6f3] transition font-medium text-center"
              >
                More Interventions
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}