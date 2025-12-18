'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const PANAS_ITEMS = {
  positive: [
    { id: 'interested', label: 'Interested' },
    { id: 'excited', label: 'Excited' },
    { id: 'strong', label: 'Strong' },
    { id: 'enthusiastic', label: 'Enthusiastic' },
    { id: 'proud', label: 'Proud' },
    { id: 'alert', label: 'Alert' },
    { id: 'inspired', label: 'Inspired' },
    { id: 'determined', label: 'Determined' },
    { id: 'attentive', label: 'Attentive' },
    { id: 'active', label: 'Active' },
  ],
  negative: [
    { id: 'distressed', label: 'Distressed' },
    { id: 'upset', label: 'Upset' },
    { id: 'guilty', label: 'Guilty' },
    { id: 'scared', label: 'Scared' },
    { id: 'hostile', label: 'Hostile' },
    { id: 'irritable', label: 'Irritable' },
    { id: 'ashamed', label: 'Ashamed' },
    { id: 'nervous', label: 'Nervous' },
    { id: 'jittery', label: 'Jittery' },
    { id: 'afraid', label: 'Afraid' },
  ],
}

const SCALE_OPTIONS = [
  { value: 1, label: 'Very slightly or not at all' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Extremely' },
]

// Combine and shuffle items for presentation
const ALL_ITEMS = [
  ...PANAS_ITEMS.positive.map(item => ({ ...item, type: 'positive' })),
  ...PANAS_ITEMS.negative.map(item => ({ ...item, type: 'negative' })),
].sort(() => Math.random() - 0.5)

export default function PANASAssessment() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [scores, setScores] = useState<{ positive: number; negative: number } | null>(null)
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

    // Get assessment ID
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('slug', 'panas')
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
    let positiveScore = 0
    let negativeScore = 0

    PANAS_ITEMS.positive.forEach(item => {
      positiveScore += responses[item.id] || 0
    })

    PANAS_ITEMS.negative.forEach(item => {
      negativeScore += responses[item.id] || 0
    })

    return { positive: positiveScore, negative: negativeScore }
  }

  const handleSubmit = async () => {
    const allAnswered = ALL_ITEMS.every(item => responses[item.id])
    
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

  const getScoreInterpretation = (type: 'positive' | 'negative', score: number) => {
    if (type === 'positive') {
      if (score >= 40) return { level: 'High', description: 'You are experiencing strong positive emotions.', color: 'text-[#5f7360]' }
      if (score >= 25) return { level: 'Moderate', description: 'You are experiencing a healthy level of positive emotions.', color: 'text-[#a68b72]' }
      return { level: 'Low', description: 'You may benefit from activities that boost positive emotions.', color: 'text-[#ee5a5a]' }
    } else {
      if (score <= 15) return { level: 'Low', description: 'You are experiencing minimal negative emotions.', color: 'text-[#5f7360]' }
      if (score <= 30) return { level: 'Moderate', description: 'You are experiencing some negative emotions, which is normal.', color: 'text-[#a68b72]' }
      return { level: 'High', description: 'You may benefit from stress-reduction activities.', color: 'text-[#ee5a5a]' }
    }
  }

  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / ALL_ITEMS.length) * 100

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
    const positiveInterp = getScoreInterpretation('positive', scores.positive)
    const negativeInterp = getScoreInterpretation('negative', scores.negative)

    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/assessments" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PANAS Results</h1>
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

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d2d2d]">Positive Affect</h3>
                  <p className="text-xs text-[#6b6b6b]">Score range: 10-50</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2d2d2d] mb-2">{scores.positive}</p>
              <p className={`text-sm font-medium ${positiveInterp.color}`}>{positiveInterp.level}</p>
              <p className="text-xs text-[#6b6b6b] mt-1">{positiveInterp.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#db2777]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d2d2d]">Negative Affect</h3>
                  <p className="text-xs text-[#6b6b6b]">Score range: 10-50</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2d2d2d] mb-2">{scores.negative}</p>
              <p className={`text-sm font-medium ${negativeInterp.color}`}>{negativeInterp.level}</p>
              <p className="text-xs text-[#6b6b6b] mt-1">{negativeInterp.description}</p>
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
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PANAS</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#e8e4df] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#ee5a5a] to-[#d94848] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-[#6b6b6b]">{answeredCount}/{ALL_ITEMS.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <p className="text-[#6b6b6b] text-sm">
            This scale consists of a number of words that describe different feelings and emotions. 
            Read each item and then select the appropriate answer. Indicate to what extent you have felt this way <strong>during the past week</strong>.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {ALL_ITEMS.map((item, index) => {
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                <p className="font-medium text-[#2d2d2d] mb-4">
                  {index + 1}. {item.label}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {SCALE_OPTIONS.map((option) => {
                    const isSelected = responses[item.id] === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(item.id, option.value)}
                        className={`p-2 rounded-xl text-center transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white'
                            : 'bg-[#f8f6f3] text-[#6b6b6b] hover:bg-[#e8e4df]'
                        }`}
                      >
                        <span className="text-lg font-semibold block">{option.value}</span>
                        <span className="text-[10px] leading-tight block">{option.label}</span>
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
          disabled={submitting || answeredCount < ALL_ITEMS.length}
          className="w-full py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </main>
    </div>
  )
}
