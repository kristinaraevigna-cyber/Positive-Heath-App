'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Resource = {
  id: string
  title: string
  description: string
  type: string
  category: string
  url: string
  video_embed_url: string
  source: string
  duration: string
  difficulty: string
  tags: string[]
  is_featured: boolean
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '📚' },
  { id: 'emotions', name: 'Emotions', icon: '💜' },
  { id: 'stress', name: 'Stress', icon: '🧘' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧠' },
  { id: 'sleep', name: 'Sleep', icon: '😴' },
  { id: 'relationships', name: 'Relationships', icon: '💕' },
  { id: 'resilience', name: 'Resilience', icon: '💪' },
]

const TYPES = [
  { id: 'all', name: 'All Types' },
  { id: 'video', name: 'Videos' },
  { id: 'article', name: 'Articles' },
  { id: 'book', name: 'Books' },
]

export default function LibraryPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, selectedCategory, selectedType, searchQuery])

  const loadResources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: resourcesData } = await supabase
      .from('resources')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    setResources(resourcesData || [])

    const { data: savedData } = await supabase
      .from('user_saved_resources')
      .select('resource_id')
      .eq('user_id', user.id)

    if (savedData) {
      setSavedIds(new Set(savedData.map((s: any) => s.resource_id)))
    }

    setLoading(false)
  }

  const filterResources = () => {
    let filtered = [...resources]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    setFilteredResources(filtered)
  }

  const toggleSave = async (resourceId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (savedIds.has(resourceId)) {
      await supabase
        .from('user_saved_resources')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
      
      setSavedIds(prev => {
        const next = new Set(prev)
        next.delete(resourceId)
        return next
      })
    } else {
      await supabase
        .from('user_saved_resources')
        .insert({ user_id: user.id, resource_id: resourceId })
      
      setSavedIds(prev => new Set([...prev, resourceId]))
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'video': return 'bg-[#fee2e2] text-[#ee5a5a]'
      case 'article': return 'bg-[#e0f2fe] text-[#0284c7]'
      case 'book': return 'bg-[#f5f3ff] text-[#7c3aed]'
      default: return 'bg-[#f8f6f3] text-[#6b6b6b]'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return 'bg-[#e3e7e3] text-[#5f7360]'
      case 'intermediate': return 'bg-[#fef3eb] text-[#e07a3a]'
      case 'advanced': return 'bg-[#fce7f3] text-[#db2777]'
      default: return 'bg-[#f8f6f3] text-[#6b6b6b]'
    }
  }

  const getButtonText = (type: string) => {
    switch(type) {
      case 'video': return 'Watch Video'
      case 'book': return 'View Book'
      default: return 'Read Article'
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
          <p className="text-[#6b6b6b]">Loading library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
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
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Well-Being Library
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, articles, books..."
              className="w-full pl-12 pr-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] transition-all bg-white"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-[#ee5a5a] text-white'
                  : 'bg-white border border-[#e8e4df] text-[#6b6b6b] hover:border-[#d4c4b5]'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedType === type.id
                  ? 'bg-[#2d2d2d] text-white'
                  : 'bg-white border border-[#e8e4df] text-[#6b6b6b] hover:border-[#d4c4b5]'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
            {selectedCategory === 'all' ? 'All Resources' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-sm text-[#6b6b6b]">{filteredResources.length} items</span>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e8e4df]">
            <div className="w-16 h-16 bg-[#f8f6f3] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-[#6b6b6b]">No resources found</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchQuery(''); }}
              className="mt-4 text-[#ee5a5a] font-medium hover:text-[#d94848] transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden hover:shadow-lg transition-all"
              >
                <button
                  onClick={() => setSelectedResource(resource)}
                  className="w-full text-left p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(resource.type)}`}>
                      {resource.type === 'video' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                        </svg>
                      )}
                      {resource.type === 'article' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      )}
                      {resource.type === 'book' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#2d2d2d] mb-2">{resource.title}</h3>
                  <p className="text-[#6b6b6b] text-sm line-clamp-2 mb-3">{resource.description}</p>
                  <span className="text-xs text-[#6b6b6b]">{resource.source} · {resource.duration}</span>
                </button>
                <div className="px-5 pb-4 flex items-center justify-between border-t border-[#e8e4df] pt-3">
                  <div className="flex gap-1">
                    {resource.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-[#f8f6f3] text-[#6b6b6b] px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(resource.id); }}
                    className={`p-2 rounded-lg transition ${
                      savedIds.has(resource.id) ? 'text-[#ee5a5a]' : 'text-[#6b6b6b] hover:text-[#ee5a5a]'
                    }`}
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill={savedIds.has(resource.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedResource && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedResource(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {selectedResource.type === 'video' && selectedResource.video_embed_url && (
              <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
                <iframe
                  src={selectedResource.video_embed_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(selectedResource.type)}`}>
                  {selectedResource.type === 'video' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                    </svg>
                  )}
                  {selectedResource.type === 'article' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                  {selectedResource.type === 'book' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="p-2 hover:bg-[#f8f6f3] rounded-lg transition text-[#6b6b6b]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="text-2xl font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedResource.title}
              </h2>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-[#6b6b6b]">{selectedResource.source}</span>
                <span className="text-[#d4c4b5]">·</span>
                <span className="text-sm text-[#6b6b6b]">{selectedResource.duration}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(selectedResource.difficulty)}`}>
                  {selectedResource.difficulty}
                </span>
              </div>

              <p className="text-[#6b6b6b] mb-6">{selectedResource.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedResource.tags.map((tag) => (
                  <span key={tag} className="text-sm bg-[#f8f6f3] text-[#6b6b6b] px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl font-medium text-center hover:shadow-lg transition"
                >
                  {getButtonText(selectedResource.type)}
                </a>
                <button
                  onClick={() => toggleSave(selectedResource.id)}
                  className={`px-4 py-3 rounded-xl border transition ${
                    savedIds.has(selectedResource.id)
                      ? 'bg-[#fee2e2] border-[#ee5a5a] text-[#ee5a5a]'
                      : 'border-[#e8e4df] text-[#6b6b6b] hover:border-[#d4c4b5]'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={savedIds.has(selectedResource.id) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
