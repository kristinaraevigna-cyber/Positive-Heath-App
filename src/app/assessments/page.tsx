'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Assessment {
  id: string
  name: string
  slug: string
  description: string
  estimated_minutes: number
}

interface CompletedAssessment {
  assessment_id: string
  completed_at: string
  scores: any
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/study-info')
      return
    }

    // Load available assessments
    const { data: assessmentsData } = await supabase
      .from('assessments')
      .select('*')
      .eq('is_active', true)
      .order('name')

    setAssessments(assessmentsData || [])

    // Load user's completed assessments
    const { data: completedData } = await supabase
      .from('assessment_responses')
      .select('assessment_id, completed_at, scores')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    setCompletedAssessments(completedData || [])

    setLoading(false)
  }

  const getLastCompleted = (assessmentId: string) => {
    const completed = completedAssessments.find(c => c.assessment_id === assessmentId)
    return completed ? new Date(completed.completed_at) : null
  }

  const getCompletionCount = (assessmentId: string) => {
    return completedAssessments.filter(c => c.assessment_id === assessmentId).length
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  }

  const getAssessmentIcon = (slug: string) => {
    if (slug === 'panas') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    )
  }

  const getAssessmentColor = (slug: string) => {
    if (slug === 'panas') {
      return 'from-[#fce7f3] to-[#fbcfe8] text-[#db2777]'
    }
    return 'from-[#f5f3ff] to-[#ede9fe] text-[#7c3aed]'
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
          <p className="text-[#6b6b6b]">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Assessments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Track Your Wellbeing
          </h2>
          <p className="text-[#6b6b6b] text-sm">
            Complete these assessments regularly to track changes in your emotional state and sense of purpose. 
            Your responses help measure the impact of the interventions you're practicing.
          </p>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const lastCompleted = getLastCompleted(assessment.id)
            const completionCount = getCompletionCount(assessment.id)
            const colorClass = getAssessmentColor(assessment.slug)

            return (
              <div key={assessment.id} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {getAssessmentIcon(assessment.slug)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#2d2d2d]">{assessment.name}</h3>
                        <p className="text-sm text-[#6b6b6b] mt-1">{assessment.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ~{assessment.estimated_minutes} min
                      </span>
                      {completionCount > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Completed {completionCount}x
                        </span>
                      )}
                      {lastCompleted && (
                        <span>Last: {formatDate(lastCompleted)}</span>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/assessments/${assessment.slug}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition"
                      >
                        {completionCount > 0 ? 'Take Again' : 'Start Assessment'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Results Link */}
        {completedAssessments.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-[#5f7360] to-[#4a5a4b] rounded-2xl p-6 text-center text-white">
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              View Your Progress
            </h2>
            <p className="text-white/80 mb-4 text-sm">
              Track how your wellbeing scores change over time
            </p>
            <Link href="/assessments/results" className="inline-flex items-center gap-2 bg-white text-[#5f7360] px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition">
              View Results
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
