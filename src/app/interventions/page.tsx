'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'calming', label: 'Calming', color: 'bg-[#e0f2fe] text-[#0284c7]' },
  { value: 'energising', label: 'Energising', color: 'bg-[#fef3eb] text-[#e07a3a]' },
  { value: 'coping', label: 'Coping', color: 'bg-[#f5f3ff] text-[#7c3aed]' },
  { value: 'feeling good', label: 'Feeling Good', color: 'bg-[#e3e7e3] text-[#5f7360]' },
  { value: 'meaning', label: 'Meaning', color: 'bg-[#fce7f3] text-[#db2777]' },
  { value: 'relationship', label: 'Relationship', color: 'bg-[#fee2e2] text-[#ee5a5a]' },
  { value: 'prospecting', label: 'Prospecting', color: 'bg-[#f5f0eb] text-[#7a6150]' },
]

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInterventions()
  }, [])

  const loadInterventions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('interventions')
      .select('*')
      .order('name')

    setInterventions(data || [])
    setLoading(false)
  }

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category.toLowerCase())
    return cat?.color || 'bg-[#f8f6f3] text-[#6b6b6b]'
  }

  const getInterventionIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'calming':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )
      case 'energising':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        )
      case 'coping':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        )
      case 'feeling good':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )
      case 'meaning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )
      case 'relationship':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        )
      case 'prospecting':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )
    }
  }

  const filteredInterventions = selectedCategory === 'all' 
    ? interventions 
    : interventions.filter(i => i.category.toLowerCase() === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-[#6b6b6b]">Loading interventions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Interventions</h1>
          </div>
          <span className="ml-auto text-sm text-[#6b6b6b]">{interventions.length} activities</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white'
                  : 'bg-white border border-[#e8e4df] text-[#6b6b6b] hover:border-[#d4c4b5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interventions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterventions.map((intervention) => (
            <button
              key={intervention.id}
              onClick={() => setSelectedIntervention(intervention)}
              className="bg-white rounded-2xl border border-[#e8e4df] p-5 text-left hover:shadow-lg hover:border-[#d4c4b5] transition group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(intervention.category)}`}>
                  {getInterventionIcon(intervention.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2d2d2d] mb-1 group-hover:text-[#ee5a5a] transition">
                    {intervention.name}
                  </h3>
                  <p className="text-sm text-[#6b6b6b] line-clamp-2 mb-3">
                    {intervention.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#6b6b6b]">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {intervention.duration_minutes} min
                    </span>
                    <span className="capitalize">{intervention.difficulty}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredInterventions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6b6b6b]">No interventions found in this category.</p>
          </div>
        )}

        {/* Research Badge */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#6b6b6b]">
            Based on research by Burke et al. (2023) • 15 evidence-based micro-interventions
          </p>
        </div>
      </main>

      {/* Intervention Detail Modal */}
      {selectedIntervention && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedIntervention(null)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#e8e4df] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(selectedIntervention.category)}`}>
                {getInterventionIcon(selectedIntervention.category)}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {selectedIntervention.name}
                </h2>
                <p className="text-xs text-[#6b6b6b] capitalize">{selectedIntervention.category}</p>
              </div>
              <button
                onClick={() => setSelectedIntervention(null)}
                className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6">
              {/* Description */}
              <div>
                <p className="text-[#6b6b6b] leading-relaxed">{selectedIntervention.description}</p>
              </div>

              {/* Duration & Difficulty */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedIntervention.duration_minutes} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6b6b6b] capitalize">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  {selectedIntervention.difficulty}
                </div>
              </div>

              {/* Benefits */}
              {selectedIntervention.benefits && selectedIntervention.benefits.length > 0 && (
                <div>
                  <h3 className="font-medium text-[#2d2d2d] mb-3">Benefits</h3>
                  <div className="space-y-2">
                    {selectedIntervention.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#5f7360] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-sm text-[#6b6b6b]">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {selectedIntervention.steps && selectedIntervention.steps.length > 0 && (
                <div>
                  <h3 className="font-medium text-[#2d2d2d] mb-3">How to do it</h3>
                  <div className="space-y-3">
                    {selectedIntervention.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#f8f6f3] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-[#6b6b6b]">{index + 1}</span>
                        </div>
                        <p className="text-sm text-[#6b6b6b]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tip */}
              {selectedIntervention.pro_tip && (
                <div className="bg-[#fef3eb] rounded-xl p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-[#e07a3a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[#e07a3a] mb-1">Pro Tip</p>
                      <p className="text-sm text-[#7a6150]">{selectedIntervention.pro_tip}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Research Source */}
              {selectedIntervention.research_source && (
                <div className="text-xs text-[#6b6b6b] pt-2 border-t border-[#e8e4df]">
                  Source: {selectedIntervention.research_source}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#e8e4df] p-4">
              <Link
                href={`/interventions/${selectedIntervention.id}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#5f7360] to-[#4a5b4b] text-white px-6 py-3.5 rounded-xl font-medium hover:shadow-lg transition"
              >
                Start This Intervention
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}