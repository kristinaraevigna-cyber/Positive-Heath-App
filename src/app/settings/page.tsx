'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [participantId, setParticipantId] = useState('')
  const [consentDate, setConsentDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/study-info')
        return
      }

      const { data: consent } = await supabase
        .from('study_consent')
        .select('participant_id, consent_timestamp')
        .eq('user_id', user.id)
        .single()

      if (consent) {
        setParticipantId(consent.participant_id)
        setConsentDate(new Date(consent.consent_timestamp).toLocaleDateString('en-IE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      }

      setLoading(false)
    }

    loadSettings()
  }, [])

  const handleWithdraw = async () => {
    setWithdrawing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mark consent as withdrawn
      await supabase
        .from('study_consent')
        .update({
          withdrawn: true,
          withdrawn_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      // Sign out
      await supabase.auth.signOut()
      
      // Clear local storage
      localStorage.removeItem('participant_id')
      localStorage.removeItem('consent_date')
      
      router.push('/study-info')
    } catch (error) {
      console.error('Error withdrawing:', error)
      alert('There was an error. Please contact the researcher.')
    } finally {
      setWithdrawing(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/study-info')
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
          <p className="text-[#6b6b6b]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b] hover:text-[#2d2d2d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f8f6f3] to-[#e8e4df] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Study Participation */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Study Participation
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#e8e4df]">
              <span className="text-[#6b6b6b]">Participant ID</span>
              <span className="font-mono text-[#2d2d2d] bg-[#f8f6f3] px-3 py-1 rounded-lg">{participantId}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-[#e8e4df]">
              <span className="text-[#6b6b6b]">Consent Date</span>
              <span className="text-[#2d2d2d]">{consentDate}</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-[#6b6b6b]">Information Sheet</span>
              <Link href="/study-info" className="text-[#ee5a5a] font-medium hover:text-[#d94848] transition">
                View
              </Link>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Your Rights (GDPR)
          </h2>
          
          <div className="space-y-3 text-sm text-[#6b6b6b]">
            <p>Under GDPR, you have the right to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Access</strong> your data</li>
              <li><strong>Rectify</strong> inaccurate data</li>
              <li><strong>Erase</strong> your data</li>
              <li><strong>Withdraw</strong> from the study</li>
            </ul>
            <p className="pt-2">
              To exercise these rights, please contact the researcher with your Participant ID.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Actions
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-[#f8f6f3] text-[#2d2d2d] rounded-xl font-medium hover:bg-[#e8e4df] transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-3 bg-white border border-[#ee5a5a] text-[#ee5a5a] rounded-xl font-medium hover:bg-[#fee2e2] transition"
            >
              Withdraw from Study
            </button>
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="bg-[#fef3eb] rounded-2xl p-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Need Support?
          </h2>
          <p className="text-sm text-[#6b6b6b] mb-3">
            If you need immediate mental health support:
          </p>
          <ul className="text-sm text-[#6b6b6b] space-y-1">
            <li><strong>Ireland:</strong> Samaritans 116 123</li>
            <li><strong>UK:</strong> Samaritans 116 123</li>
            <li><strong>Emergency:</strong> 999 / 112</li>
          </ul>
        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Withdraw from Study
            </h2>
            <p className="text-[#6b6b6b] mb-4">
              Are you sure you want to withdraw from this study? You can withdraw at any time without giving a reason.
            </p>
            <p className="text-sm text-[#6b6b6b] mb-6">
              Your data will be marked for deletion. To fully delete your data, please also contact the researcher.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-[#f8f6f3] text-[#2d2d2d] rounded-xl font-medium hover:bg-[#e8e4df] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 py-3 bg-[#ee5a5a] text-white rounded-xl font-medium hover:bg-[#d94848] transition disabled:opacity-50"
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
