'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LibraryPage() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('resources').select('*')
      setResources(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">Back</Link>
          <h1 className="font-semibold">Well-Being Library</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            return (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl border p-4 hover:shadow-lg">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{r.type}</span>
                <h3 className="font-semibold mt-2 mb-1">{r.title}</h3>
                <p className="text-sm text-gray-600">{r.description}</p>
              </a>
            )
          })}
        </div>

        {resources.length === 0 && (
          <p className="text-center py-12 text-gray-500">No resources found</p>
        )}
      </main>
    </div>
  )
}
