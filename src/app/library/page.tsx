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
  { id: 'all', name: 'All' },
  { id: 'emotions', name: 'Emotions' },
  { id: 'stress', name: 'Stress' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'sleep', name: 'Sleep' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'resilience', name: 'Resilience' },
]

export default function LibraryPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('is_featured', { ascending: false })

    setResources(data || [])
    setLoading(false)
  }

  const filtered = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <p className="text-[#6b6b6b]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-[#6b6b6b]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="font-semibold text-[#2d2d2d]">Well-Being Library</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                selectedCategory === cat.id
                  ? 'bg-[#ee5a5a] text-white'
                  : 'bg-white border border-[#e8e4df] text-[#6b6b6b]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <div
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className="bg-white rounded-2xl border border-[#e8e4df] p-5 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-[#f8f6f3] px-2 py-1 rounded-full text-[#6b6b6b]">
                  {resource.type}
                </span>
                <span className="text-xs bg-[#e3e7e3] px-2 py-1 rounded-full text-[#5f7360]">
                  {resource.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-[#2d2d2d] mb-2">{resource.title}</h3>
              <p className="text-[#6b6b6b] text-sm line-clamp-2 mb-3">{resource.description}</p>
              <p className="text-xs text-[#6b6b6b]">{resource.source} · {resource.duration}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6b6b6b]">No resources found</p>
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
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs bg-[#f8f6f3] px-2 py-1 rounded-full text-[#6b6b6b]">
                    {selectedResource.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="p-2 text-[#6b6b6b]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="text-2xl font-semibold text-[#2d2d2d] mb-2">{selectedResource.title}</h2>
              <p className="text-sm text-[#6b6b6b] mb-4">{selectedResource.source} · {selectedResource.duration}</p>
              <p className="text-[#6b6b6b] mb-6">{selectedResource.description}</p>

              
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-[#ee5a5a] text-white rounded-xl font-medium text-center"
              >
                Open Resource
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
