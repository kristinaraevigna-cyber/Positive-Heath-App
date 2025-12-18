'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ConsentPage() {
  const [participantId, setParticipantId] = useState('')
  const [consent, setConsent] = useState({
    readInfo: false,
    understandData: false,
    understandWithdraw: false,
    confirmAge: false,
    agreeParticipate: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const allChecked = Object.values(consent).every(v => v)
  const validId = /^PHC\d{3}$/.test(participantId.toUpperCase())

  const handleSubmit = async () => {
    if (!allChecked || !validId) return
    
    setLoading(true)
    setError('')
    
    const formattedId = participantId.toUpperCase()
    
    try {
      // Check if participant ID exists and is not already used
      const { data: participant, error: checkError } = await supabase
        .from('study_participants')
        .select('participant_id, is_active')
        .eq('participant_id', formattedId)
        .single()

      if (checkError || !participant) {
        setError('Invalid Participant ID. Please check the ID provided by the researcher.')
        setLoading(false)
        return
      }

      // Check if already consented
      const { data: existingConsent } = await supabase
        .from('study_consent')
        .select('id')
        .eq('participant_id', formattedId)
        .single()

      if (existingConsent) {
        setError('This Participant ID has already been used. Please contact the researcher.')
        setLoading(false)
        return
      }

      // Sign in anonymously
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      
      if (authError) throw authError

      if (authData.user) {
        // Store consent record
        const { error: consentError } = await supabase
          .from('study_consent')
          .insert({
            participant_id: formattedId,
            user_id: authData.user.id,
            read_information_sheet: consent.readInfo,
            understand_data_storage: consent.understandData,
            understand_withdrawal: consent.understandWithdraw,
            confirm_age_18_plus: consent.confirmAge,
            agree_to_participate: consent.agreeParticipate,
            consent_given: true,
            consent_timestamp: new Date().toISOString(),
            browser_info: navigator.userAgent,
          })

        if (consentError) throw consentError

        // Update profile with participant ID
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            participant_id: formattedId,
          })

        if (profileError) throw profileError

        // Store in localStorage for reference
        localStorage.setItem('participant_id', formattedId)
        localStorage.setItem('consent_date', new Date().toISOString())

        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError('Something went wrong. Please try again or contact the researcher.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
            Positive Health Coach
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#e3e7e3] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Informed Consent Form
            </h1>
          </div>

          <p className="text-sm text-[#6b6b6b] mb-6">
            Please read each statement carefully and tick the box to confirm your agreement.
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition">
              <input
                type="checkbox"
                checked={consent.readInfo}
                onChange={(e) => setConsent({...consent, readInfo: e.target.checked})}
                className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
              />
              <span className="text-[#2d2d2d] text-sm leading-relaxed">
                I confirm that I have read and understood the <Link href="/study-info" className="text-[#ee5a5a] underline">Participant Information Sheet</Link> (Version 1.0) for this study.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition">
              <input
                type="checkbox"
                checked={consent.understandData}
                onChange={(e) => setConsent({...consent, understandData: e.target.checked})}
                className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
              />
              <span className="text-[#2d2d2d] text-sm leading-relaxed">
                I understand that my data will be stored pseudonymously under a Participant ID, and that my identity will not be stored in the app.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition">
              <input
                type="checkbox"
                checked={consent.understandWithdraw}
                onChange={(e) => setConsent({...consent, understandWithdraw: e.target.checked})}
                className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
              />
              <span className="text-[#2d2d2d] text-sm leading-relaxed">
                I understand that my participation is voluntary and that I am free to withdraw at any time, without giving any reason and without any consequences.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition">
              <input
                type="checkbox"
                checked={consent.confirmAge}
                onChange={(e) => setConsent({...consent, confirmAge: e.target.checked})}
                className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
              />
              <span className="text-[#2d2d2d] text-sm leading-relaxed">
                I confirm that I am 18 years of age or older.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition">
              <input
                type="checkbox"
                checked={consent.agreeParticipate}
                onChange={(e) => setConsent({...consent, agreeParticipate: e.target.checked})}
                className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
              />
              <span className="text-[#2d2d2d] text-sm leading-relaxed">
                I agree to take part in this research study.
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
          <h2 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Enter Your Participant ID
          </h2>
          <p className="text-sm text-[#6b6b6b] mb-4">
            Please enter the Participant ID provided to you by the researcher (e.g., PHC001).
          </p>

          <input
            type="text"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
            placeholder="PHC001"
            maxLength={6}
            className="w-full px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] transition-all bg-white text-center text-xl font-mono tracking-widest mb-4"
          />

          {error && (
            <div className="mb-4 p-3 bg-[#fee2e2] text-[#dc2626] text-sm rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allChecked || !validId || loading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition ${
              allChecked && validId && !loading
                ? 'bg-gradient-to-r from-[#ee5a5a] to-[#d94848] hover:shadow-lg'
                : 'bg-[#d4c4b5] cursor-not-allowed'
            }`}
          >
            {loading ? 'Setting up...' : 'I Consent — Join Study'}
          </button>

          <p className="text-center text-xs text-[#6b6b6b] mt-4">
            By continuing, you are providing informed consent to participate in this research study.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/study-info" className="text-sm text-[#ee5a5a] hover:text-[#d94848] transition">
            ← Back to Information Sheet
          </Link>
        </div>
      </main>
    </div>
  )
}
