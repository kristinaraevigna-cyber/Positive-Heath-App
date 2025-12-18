'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const PHQ9_ITEMS = [
  { id: 'q1', text: 'Little interest or pleasure in doing things' },
  { id: 'q2', text: 'Feeling down, depressed, or hopeless' },
  { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
  { id: 'q4', text: 'Feeling tired or having little energy' },
  { id: 'q5', text: 'Poor appetite or overeating' },
  { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
  { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
  { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual' },
  { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way' },
]

const SCALE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

export default function PHQ9Assessment() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [scores, setScores] = useState<{ total: number } | null>(null)
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
      .eq('slug', 'phq-9')
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
    let total = 0
    PHQ9_ITEMS.forEach(item => {
      total += responses[item.id] || 0
    })
    return { total }
  }

  const handleSubmit = async () => {
    const allAnswered = PHQ9_ITEMS.every(item => responses[item.id] !== undefined)
    
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

  const getSeverity = (score: number) => {
    if (score <= 4) return { 
      level: 'Minimal', 
      color: 'text-[#5f7360]', 
      bg: 'bg-[#5f7360]',
      description: 'Your symptoms suggest minimal depression.',
      recommendation: 'Continue with your wellbeing practices.'
    }
    if (score <= 9) return { 
      level: 'Mild', 
      color: 'text-[#a68b72]', 
      bg: 'bg-[#a68b72]',
      description: 'Your symptoms suggest mild depression.',
      recommendation: 'Consider monitoring your symptoms and using wellbeing interventions.'
    }
    if (score <= 14) return { 
      level: 'Moderate', 
      color: 'text-[#e07a3a]', 
      bg: 'bg-[#e07a3a]',
      description: 'Your symptoms suggest moderate depression.',
      recommendation: 'Consider speaking with a healthcare provider.'
    }
    if (score <= 19) return { 
      level: 'Moderately Severe', 
      color: 'text-[#ee5a5a]', 
      bg: 'bg-[#ee5a5a]',
      description: 'Your symptoms suggest moderately severe depression.',
      recommendation: 'It is recommended to speak with a healthcare provider.'
    }
    return { 
      level: 'Severe', 
      color: 'text-[#dc2626]', 
      bg: 'bg-[#dc2626]',
      description: 'Your symptoms suggest severe depression.',
      recommendation: 'Please speak with a healthcare provider as soon as possible.'
    }
  }

  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / PHQ9_ITEMS.length) * 100

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
    const severity = getSeverity(scores.total)

    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/assessments" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PHQ-9 Results</h1>
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
              Assessment Complete
            </h2>
            <p className="text-[#6b6b6b] text-sm">Your PHQ-9 screening results</p>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#2d2d2d]">Total Score</h3>
                <p className="text-xs text-[#6b6b6b]">Range: 0-27</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#2d2d2d]">{scores.total}</p>
                <p className={`text-sm font-medium ${severity.color}`}>{severity.level}</p>
              </div>
            </div>
            
            <div className="bg-[#e8e4df] rounded-full h-3 mb-4">
              <div 
                className={`${severity.bg} h-3 rounded-full transition-all`} 
                style={{ width: `${(scores.total / 27) * 100}%` }} 
              />
            </div>

            <div className="flex justify-between text-xs text-[#6b6b6b] mb-6">
              <span>0-4 Minimal</span>
              <span>5-9 Mild</span>
              <span>10-14 Moderate</span>
              <span>15-19 Mod. Severe</span>
              <span>20-27 Severe</span>
            </div>

            <div className="bg-[#f8f6f3] rounded-xl p-4">
              <p className="text-sm text-[#2d2d2d] mb-2">{severity.description}</p>
              <p className="text-sm text-[#6b6b6b]">{severity.recommendation}</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-[#fef3eb] border border-[#fde5d5] rounded-2xl p-6 mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#fde5d5] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#e07a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-[#2d2d2d] mb-1">Important Notice</h4>
                <p className="text-sm text-[#6b6b6b]">
                  This screening tool is not a diagnosis. If you're experiencing symptoms of depression 
                  or have thoughts of self-harm, please reach out to a healthcare professional or contact 
                  a crisis helpline.
                </p>
              </div>
            </div>
          </div>

          {/* Crisis Resources */}
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <h4 className="font-medium text-[#2d2d2d] mb-3">Support Resources</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#6b6b6b]">
                <svg className="w-4 h-4 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span><strong>Samaritans:</strong> 116 123 (Ireland & UK, free, 24/7)</span>
              </div>
              <div className="flex items-center gap-2 text-[#6b6b6b]">
                <svg className="w-4 h-4 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span><strong>Pieta House:</strong> 1800 247 247 (Ireland)</span>
              </div>
              <div className="flex items-center gap-2 text-[#6b6b6b]">
                <svg className="w-4 h-4 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span><strong>Emergency:</strong> 999 or 112</span>
              </div>
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
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>PHQ-9</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#e8e4df] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#ee5a5a] to-[#d94848] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-[#6b6b6b]">{answeredCount}/{PHQ9_ITEMS.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <p className="text-[#6b6b6b] text-sm">
            Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the following problems?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {PHQ9_ITEMS.map((item, index) => {
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#e8e4df] p-5">
                <p className="font-medium text-[#2d2d2d] mb-4">
                  {index + 1}. {item.text}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SCALE_OPTIONS.map((option) => {
                    const isSelected = responses[item.id] === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(item.id, option.value)}
                        className={`p-3 rounded-xl text-center transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white'
                            : 'bg-[#f8f6f3] text-[#6b6b6b] hover:bg-[#e8e4df]'
                        }`}
                      >
                        <span className="text-sm font-medium block">{option.label}</span>
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
          disabled={submitting || answeredCount < PHQ9_ITEMS.length}
          className="w-full py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </main>
    </div>
  )
}
