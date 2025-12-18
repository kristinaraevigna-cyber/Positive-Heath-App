'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const PERMA_ITEMS = [
  // Positive Emotions (P)
  { id: 'p1', text: 'In general, how often do you feel joyful?', subscale: 'positive_emotions', type: 'frequency' },
  { id: 'p2', text: 'In general, how often do you feel positive?', subscale: 'positive_emotions', type: 'frequency' },
  { id: 'p3', text: 'In general, how often do you feel contented?', subscale: 'positive_emotions', type: 'frequency' },
  
  // Engagement (E)
  { id: 'e1', text: 'How often do you become absorbed in what you are doing?', subscale: 'engagement', type: 'frequency' },
  { id: 'e2', text: 'In general, how often do you feel excited and interested in things?', subscale: 'engagement', type: 'frequency' },
  { id: 'e3', text: 'How often do you lose track of time while doing something you enjoy?', subscale: 'engagement', type: 'frequency' },
  
  // Relationships (R)
  { id: 'r1', text: 'How satisfied are you with your personal relationships?', subscale: 'relationships', type: 'satisfaction' },
  { id: 'r2', text: 'How often do you feel loved?', subscale: 'relationships', type: 'frequency' },
  { id: 'r3', text: 'How satisfied are you with the support you receive from others?', subscale: 'relationships', type: 'satisfaction' },
  
  // Meaning (M)
  { id: 'm1', text: 'In general, to what extent do you feel that what you do in your life is valuable and worthwhile?', subscale: 'meaning', type: 'extent' },
  { id: 'm2', text: 'To what extent do you generally feel that you have a sense of direction in your life?', subscale: 'meaning', type: 'extent' },
  { id: 'm3', text: 'In general, to what extent do you feel that your life has purpose?', subscale: 'meaning', type: 'extent' },
  
  // Accomplishment (A)
  { id: 'a1', text: 'How much of the time do you feel you are making progress towards accomplishing your goals?', subscale: 'accomplishment', type: 'frequency' },
  { id: 'a2', text: 'How often do you achieve the important goals you have set for yourself?', subscale: 'accomplishment', type: 'frequency' },
  { id: 'a3', text: 'How often are you able to handle your responsibilities?', subscale: 'accomplishment', type: 'frequency' },
  
  // Physical Health (+1)
  { id: 'ph1', text: 'In general, how would you say your health is?', subscale: 'physical_health', type: 'health' },
  { id: 'ph2', text: 'How satisfied are you with your current physical health?', subscale: 'physical_health', type: 'satisfaction' },
  { id: 'ph3', text: 'Compared to others of your age, how is your health?', subscale: 'physical_health', type: 'comparison' },
  
  // Mindset (+2)
  { id: 'mi1', text: 'I believe that my abilities can be developed through dedication and hard work.', subscale: 'mindset', type: 'agreement' },
  { id: 'mi2', text: 'When I face setbacks, I see them as opportunities to learn and grow.', subscale: 'mindset', type: 'agreement' },
  { id: 'mi3', text: 'I embrace challenges as opportunities to improve myself.', subscale: 'mindset', type: 'agreement' },
  
  // Environment (+3)
  { id: 'en1', text: 'How satisfied are you with your living environment?', subscale: 'environment', type: 'satisfaction' },
  { id: 'en2', text: 'How safe do you feel in your daily life?', subscale: 'environment', type: 'extent' },
  { id: 'en3', text: 'How satisfied are you with your access to nature and green spaces?', subscale: 'environment', type: 'satisfaction' },
  
  // Economic Security (+4)
  { id: 'ec1', text: 'How satisfied are you with your current financial situation?', subscale: 'economic', type: 'satisfaction' },
  { id: 'ec2', text: 'How often do you worry about meeting your basic financial needs?', subscale: 'economic', type: 'frequency_reverse' },
  { id: 'ec3', text: 'To what extent do you feel financially secure?', subscale: 'economic', type: 'extent' },
]

const SCALE_OPTIONS = [
  { value: 0, label: 'Never / Not at all' },
  { value: 1, label: 'Rarely / Slightly' },
  { value: 2, label: 'Sometimes / Somewhat' },
  { value: 3, label: 'Often / Mostly' },
  { value: 4, label: 'Always / Completely' },
]

export default function PERMAAssessment() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [scores, setScores] = useState<Record<string, number> | null>(null)
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
      .eq('slug', 'perma-plus-4')
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
    const subscales = {
      positive_emotions: 0,
      engagement: 0,
      relationships: 0,
      meaning: 0,
      accomplishment: 0,
      physical_health: 0,
      mindset: 0,
      environment: 0,
      economic: 0,
    }

    PERMA_ITEMS.forEach(item => {
      let score = responses[item.id] || 0
      // Reverse score for ec2 (worry question)
      if (item.type === 'frequency_reverse') {
        score = 4 - score
      }
      subscales[item.subscale as keyof typeof subscales] += score
    })

    // Calculate PERMA total (original 5 dimensions)
    const permaTotal = subscales.positive_emotions + subscales.engagement + 
                       subscales.relationships + subscales.meaning + subscales.accomplishment

    // Calculate +4 total
    const plus4Total = subscales.physical_health + subscales.mindset + 
                       subscales.environment + subscales.economic

    return {
      ...subscales,
      perma_total: permaTotal,
      plus4_total: plus4Total,
      overall_total: permaTotal + plus4Total,
    }
  }

  const handleSubmit = async () => {
    const allAnswered = PERMA_ITEMS.every(item => responses[item.id] !== undefined)
    
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

  const getScoreLevel = (score: number, max: number) => {
    const pct = (score / max) * 100
    if (pct >= 75) return { level: 'High', color: 'text-[#5f7360]', bg: 'bg-[#5f7360]' }
    if (pct >= 50) return { level: 'Moderate', color: 'text-[#a68b72]', bg: 'bg-[#a68b72]' }
    return { level: 'Low', color: 'text-[#ee5a5a]', bg: 'bg-[#ee5a5a]' }
  }

  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / PERMA_ITEMS.length) * 100

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
    const subscaleLabels: Record<string, string> = {
      positive_emotions: 'Positive Emotions',
      engagement: 'Engagement',
      relationships: 'Relationships',
      meaning: 'Meaning',
      accomplishment: 'Accomplishment',
      physical_health: 'Physical Health',
      mindset: 'Mindset',
      environment: 'Environment',
      economic: 'Economic Security',
    }

    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/assessments" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PERMA+4 Results</h1>
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
            <p className="text-[#6b6b6b] text-sm">Your flourishing profile</p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Overall Flourishing Score</h3>
              <span className="text-xs text-white/70">Range: 0-108</span>
            </div>
            <p className="text-4xl font-bold mb-2">{scores.overall_total}</p>
            <div className="flex gap-4 text-sm">
              <span>PERMA: {scores.perma_total}/60</span>
              <span>+4: {scores.plus4_total}/48</span>
            </div>
          </div>

          {/* PERMA Dimensions */}
          <h3 className="font-semibold text-[#2d2d2d] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>PERMA Dimensions</h3>
          <div className="grid gap-3 mb-6">
            {['positive_emotions', 'engagement', 'relationships', 'meaning', 'accomplishment'].map((key) => {
              const score = scores[key]
              const level = getScoreLevel(score, 12)
              return (
                <div key={key} className="bg-white rounded-xl border border-[#e8e4df] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#2d2d2d] text-sm">{subscaleLabels[key]}</span>
                    <span className="text-lg font-bold text-[#2d2d2d]">{score}/12</span>
                  </div>
                  <div className="bg-[#e8e4df] rounded-full h-2">
                    <div className={`${level.bg} h-2 rounded-full transition-all`} style={{ width: `${(score / 12) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* +4 Dimensions */}
          <h3 className="font-semibold text-[#2d2d2d] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>+4 Dimensions</h3>
          <div className="grid gap-3 mb-6">
            {['physical_health', 'mindset', 'environment', 'economic'].map((key) => {
              const score = scores[key]
              const level = getScoreLevel(score, 12)
              return (
                <div key={key} className="bg-white rounded-xl border border-[#e8e4df] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#2d2d2d] text-sm">{subscaleLabels[key]}</span>
                    <span className="text-lg font-bold text-[#2d2d2d]">{score}/12</span>
                  </div>
                  <div className="bg-[#e8e4df] rounded-full h-2">
                    <div className={`${level.bg} h-2 rounded-full transition-all`} style={{ width: `${(score / 12) * 100}%` }} />
                  </div>
                </div>
              )
            })}
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
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PERMA+4</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#e8e4df] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#ee5a5a] to-[#d94848] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-[#6b6b6b]">{answeredCount}/{PERMA_ITEMS.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <p className="text-[#6b6b6b] text-sm">
            Please respond to the following questions using the scale provided. There are no right or wrong answers.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {PERMA_ITEMS.map((item, index) => {
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                <p className="font-medium text-[#2d2d2d] mb-4">
                  {index + 1}. {item.text}
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
          disabled={submitting || answeredCount < PERMA_ITEMS.length}
          className="w-full py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </main>
    </div>
  )
}
