'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const CLAREMONT_ITEMS = [
  { id: 'q1', text: 'I have a purpose in my life.', subscale: 'personal_meaning' },
  { id: 'q2', text: 'I have a good sense of what makes my life meaningful.', subscale: 'personal_meaning' },
  { id: 'q3', text: 'I have discovered a satisfying life purpose.', subscale: 'personal_meaning' },
  { id: 'q4', text: 'My life has a clear sense of purpose.', subscale: 'personal_meaning' },
  { id: 'q5', text: 'I have goals in life that are worth pursuing.', subscale: 'goal_orientation' },
  { id: 'q6', text: 'I know what I want to achieve in my life.', subscale: 'goal_orientation' },
  { id: 'q7', text: 'I am always working toward accomplishing something important to me.', subscale: 'goal_orientation' },
  { id: 'q8', text: 'I have set goals that will help me fulfill my purpose in life.', subscale: 'goal_orientation' },
  { id: 'q9', text: 'My purpose in life is to contribute to others.', subscale: 'beyond_self' },
  { id: 'q10', text: 'I want to make a positive difference in the world.', subscale: 'beyond_self' },
  { id: 'q11', text: 'I believe it is important to make a contribution to society.', subscale: 'beyond_self' },
  { id: 'q12', text: 'I am motivated to give back to my community.', subscale: 'beyond_self' },
]

const SCALE_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Slightly Disagree' },
  { value: 4, label: 'Slightly Agree' },
  { value: 5, label: 'Agree' },
  { value: 6, label: 'Strongly Agree' },
]

export default function ClaremontPurposeAssessment() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [scores, setScores] = useState<{
    total: number
    personal_meaning: number
    goal_orientation: number
    beyond_self: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAssessment()
  }, [])

  const loadAssessment = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/study-info')
      return
    }

    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('slug', 'claremont-purpose')
      .single()

    if (assessment) {
      setAssessmentId(assessment.id)
    }

    setLoading(false)
  }

  const handleResponse = (itemId: string, value: number) => {
    setResponses(prev => ({ ...prev, [itemId]: value }))
  }

  const calculateScores = () => {
    let personalMeaning = 0
    let goalOrientation = 0
    let beyondSelf = 0

    CLAREMONT_ITEMS.forEach(item => {
      const score = responses[item.id] || 0
      if (item.subscale === 'personal_meaning') personalMeaning += score
      if (item.subscale === 'goal_orientation') goalOrientation += score
      if (item.subscale === 'beyond_self') beyondSelf += score
    })

    return {
      total: personalMeaning + goalOrientation + beyondSelf,
      personal_meaning: personalMeaning,
      goal_orientation: goalOrientation,
      beyond_self: beyondSelf,
    }
  }

  const handleSubmit = async () => {
    const allAnswered = CLAREMONT_ITEMS.every(item => responses[item.id])
    
    if (!allAnswered) {
      alert('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !assessmentId) {
      setSubmitting(false)
      return
    }

    const calculatedScores = calculateScores()

    const { error } = await supabase
      .from('assessment_responses')
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        responses: responses,
        scores: calculatedScores,
      })

    if (error) {
      console.error('Error saving assessment:', error)
      alert('Failed to save assessment. Please try again.')
    } else {
      setScores(calculatedScores)
      setCompleted(true)
    }

    setSubmitting(false)
  }

  const getScoreInterpretation = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 75) return { level: 'High', description: 'You have a strong sense in this area.', color: 'text-[#5f7360]' }
    if (percentage >= 50) return { level: 'Moderate', description: 'You have a developing sense in this area.', color: 'text-[#a68b72]' }
    return { level: 'Developing', description: 'This is an area for potential growth.', color: 'text-[#ee5a5a]' }
  }

  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / CLAREMONT_ITEMS.length) * 100

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

  if (completed && scores) {
    const totalInterp = getScoreInterpretation(scores.total, 72)
    const meaningInterp = getScoreInterpretation(scores.personal_meaning, 24)
    const goalsInterp = getScoreInterpretation(scores.goal_orientation, 24)
    const beyondInterp = getScoreInterpretation(scores.beyond_self, 24)

    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/assessments" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Purpose Scale Results</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Assessment Complete!
            </h2>
            <p className="text-[#6b6b6b] text-sm">Here are your results</p>
          </div>

          {/* Total Score */}
          <div className="bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#7c3aed]">Overall Purpose Score</h3>
              <span className="text-xs text-[#7c3aed]/70">Range: 12-72</span>
            </div>
            <p className="text-4xl font-bold text-[#7c3aed] mb-2">{scores.total}</p>
            <p className={`text-sm font-medium ${totalInterp.color}`}>{totalInterp.level}</p>
            <p className="text-xs text-[#6b6b6b] mt-1">{totalInterp.description}</p>
          </div>

          {/* Subscale Scores */}
          <div className="grid gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#2d2d2d]">Personal Meaning</h4>
                <span className="text-xs text-[#6b6b6b]">Range: 4-24</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-[#2d2d2d]">{scores.personal_meaning}</p>
                <div className="flex-1">
                  <div className="bg-[#e8e4df] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] h-2 rounded-full"
                      style={{ width: `${(scores.personal_meaning / 24) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6b6b6b] mt-2">How much meaning and purpose you perceive in your life</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#2d2d2d]">Goal Orientation</h4>
                <span className="text-xs text-[#6b6b6b]">Range: 4-24</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-[#2d2d2d]">{scores.goal_orientation}</p>
                <div className="flex-1">
                  <div className="bg-[#e8e4df] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-2 rounded-full"
                      style={{ width: `${(scores.goal_orientation / 24) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6b6b6b] mt-2">How actively you are pursuing meaningful goals</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#2d2d2d]">Beyond-the-Self</h4>
                <span className="text-xs text-[#6b6b6b]">Range: 4-24</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-[#2d2d2d]">{scores.beyond_self}</p>
                <div className="flex-1">
                  <div className="bg-[#e8e4df] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#5f7360] to-[#7a9a7c] h-2 rounded-full"
                      style={{ width: `${(scores.beyond_self / 24) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6b6b6b] mt-2">Your motivation to contribute to others and society</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/assessments" className="flex-1 py-3 border border-[#e8e4df] text-[#6b6b6b] rounded-xl font-medium text-center hover:bg-white transition">
              Back to Assessments
            </Link>
            <Link href="/dashboard" className="flex-1 py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium text-center hover:shadow-lg transition">
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Link href="/assessments" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Claremont Purpose Scale</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#e8e4df] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-[#6b6b6b]">{answeredCount}/{CLAREMONT_ITEMS.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <p className="text-[#6b6b6b] text-sm">
            Please read each statement carefully and indicate how much you agree or disagree with each one. 
            There are no right or wrong answers.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {CLAREMONT_ITEMS.map((item, index) => {
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                <p className="font-medium text-[#2d2d2d] mb-4">
                  {index + 1}. {item.text}
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {SCALE_OPTIONS.map((option) => {
                    const isSelected = responses[item.id] === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(item.id, option.value)}
                        className={`p-2 rounded-xl text-center transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white'
                            : 'bg-[#f8f6f3] text-[#6b6b6b] hover:bg-[#e8e4df]'
                        }`}
                      >
                        <span className="text-lg font-semibold block">{option.value}</span>
                        <span className="text-[9px] leading-tight block">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < CLAREMONT_ITEMS.length}
          className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </main>
    </div>
  )
}
