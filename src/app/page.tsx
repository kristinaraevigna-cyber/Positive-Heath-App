'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: consent } = await supabase
          .from('study_consent')
          .select('consent_given')
          .eq('user_id', user.id)
          .single()

        if (consent?.consent_given) {
          router.push('/dashboard')
        } else {
          router.push('/study-info')
        }
      } else {
        router.push('/study-info')
      }
    }
    
    checkUser()
  }, [])

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

