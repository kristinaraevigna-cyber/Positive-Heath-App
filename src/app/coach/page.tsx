'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type CoachingMode = 'quick' | 'appreciative'

type Session = {
  id: string
  mode: string
  title: string
  message_count: number
  created_at: string
  is_active: boolean
}

const LANGUAGES = [
  { code: 'en', name: 'English', speechCode: 'en-US', flag: '🇬🇧' },
  { code: 'es', name: 'Español', speechCode: 'es-ES', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', speechCode: 'fr-FR', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', speechCode: 'de-DE', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', speechCode: 'pt-BR', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', speechCode: 'it-IT', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', speechCode: 'nl-NL', flag: '🇳🇱' },
  { code: 'zh', name: '中文', speechCode: 'zh-CN', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', speechCode: 'ja-JP', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', speechCode: 'ko-KR', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', speechCode: 'ar-SA', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'ga', name: 'Gaeilge', speechCode: 'ga-IE', flag: '🇮🇪' },
]

function CoachContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [language, setLanguage] = useState('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [coachingMode, setCoachingMode] = useState<CoachingMode | null>(null)
  const [userName, setUserName] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pastSessions, setPastSessions] = useState<Session[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserId(user.id)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, preferred_language')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUserName(profile.full_name || '')
        if (profile.preferred_language) {
          setLanguage(profile.preferred_language)
        }
      }

      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setPastSessions(sessions || [])

      const urlSessionId = searchParams.get('session')
      if (urlSessionId) {
        await loadSession(urlSessionId)
      }
      
      setInitializing(false)
    }
    
    init()

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)
    }

    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLang.speechCode
    }
  }, [language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = async (id: string) => {
    const { data: session } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (session) {
      setSessionId(session.id)
      setCoachingMode(session.mode as CoachingMode)

      const { data: msgs } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs.map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content
        })))
      }
      
      setShowHistory(false)
    }
  }

  const createSession = async (mode: CoachingMode) => {
    if (!userId) return null

    const { data } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: userId,
        mode: mode,
        title: mode === 'quick' ? 'Quick Check-in' : 'Appreciative Inquiry',
        is_active: true
      })
      .select()
      .single()

    if (data) {
      setSessionId(data.id)
      return data.id
    }
    return null
  }

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!sessionId) return

    await supabase.from('session_messages').insert({
      session_id: sessionId,
      role,
      content
    })

    const updates: any = { message_count: messages.length + 1 }
    if (messages.length === 0 && role === 'user') {
      updates.title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
    }
    
    await supabase
      .from('coaching_sessions')
      .update(updates)
      .eq('id', sessionId)
  }

  const endSession = async () => {
    if (!sessionId) return

    await supabase
      .from('coaching_sessions')
      .update({ 
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.lang = currentLang.speechCode
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true)
      
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 4000), voice: 'nova' })
      })

      if (!response.ok) throw new Error('TTS failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error) {
      console.error('Speech error:', error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    setIsSpeaking(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const selectMode = async (mode: CoachingMode) => {
    setCoachingMode(mode)
    await createSession(mode)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !coachingMode) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage
    }
    setMessages(prev => [...prev, newUserMsg])
    
    await saveMessage('user', userMessage)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          language: currentLang.name,
          mode: coachingMode,
          userId: userId
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message
      }
      setMessages(prev => [...prev, assistantMsg])
      
      await saveMessage('assistant', data.message)

      if (autoSpeak) speakText(data.message)

    } catch (error) {
      console.error('Error:', error)
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I had trouble responding. Please try again."
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const startNewSession = async () => {
    if (sessionId && messages.length > 0) {
      await endSession()
    }
    setMessages([])
    setCoachingMode(null)
    setSessionId(null)
    setShowHistory(false)
    
    if (userId) {
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      setPastSessions(sessions || [])
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-[#6b6b6b]">Loading your coach...</p>
        </div>
      </div>
    )
  }

  if (!coachingMode) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
                Positive Health Coach
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {pastSessions.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                    showHistory ? 'bg-[#fee2e2] text-[#ee5a5a]' : 'text-[#6b6b6b] hover:bg-[#f8f6f3]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </button>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#2d2d2d] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            {showHistory && pastSessions.length > 0 && (
              <div className="mb-8 bg-white rounded-2xl border border-[#e8e4df] p-5">
                <h3 className="font-semibold text-[#2d2d2d] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Past Sessions
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pastSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[#f8f6f3] transition flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        session.mode === 'quick' ? 'bg-[#fee2e2] text-[#ee5a5a]' : 'bg-[#e3e7e3] text-[#5f7360]'
                      }`}>
                        {session.mode === 'quick' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2d2d2d] truncate">{session.title}</p>
                        <p className="text-xs text-[#6b6b6b]">
                          {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {' · '}{session.message_count} messages
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#ee5a5a]/20">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h1 className="text-3xl text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {userName ? `Hello, ${userName.split(' ')[0]}` : 'Hello'}
              </h1>
              <p className="text-[#6b6b6b]">Choose your coaching experience</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => selectMode('quick')}
                className="bg-white p-8 rounded-2xl border-2 border-[#e8e4df] hover:border-[#ee5a5a] hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>In the Moment</h2>
                  <p className="text-[#6b6b6b] text-sm">5-10 min quick check-in</p>
                </div>
              </button>

              <button
                onClick={() => selectMode('appreciative')}
                className="bg-white p-8 rounded-2xl border-2 border-[#e8e4df] hover:border-[#5f7360] hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Appreciative Inquiry</h2>
                  <p className="text-[#6b6b6b] text-sm">Deep strengths-based coaching</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const modeConfig = {
    quick: { title: 'In the Moment', color: 'from-[#ee5a5a] to-[#d94848]' },
    appreciative: { title: 'Appreciative Inquiry', color: 'from-[#5f7360] to-[#4a5b4b]' }
  }
  const currentModeConfig = modeConfig[coachingMode]

  return (
    <div className="min-h-screen bg-[#f8f6f3] flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={startNewSession} className="p-2 hover:bg-[#f8f6f3] rounded-xl transition text-[#6b6b6b]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-[#2d2d2d] text-sm">{currentModeConfig.title}</h1>
            <p className="text-xs text-[#6b6b6b]">Positive Health Coach</p>
          </div>
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-lg transition ${autoSpeak ? 'bg-[#fee2e2] text-[#d94848]' : 'text-[#6b6b6b] hover:bg-[#f8f6f3]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl text-[#2d2d2d] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {coachingMode === 'quick' ? "What's on your mind?" : "Let's explore your strengths"}
              </h2>
              <p className="text-[#6b6b6b] text-sm">Type a message or use your voice</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? `bg-gradient-to-br ${currentModeConfig.color} text-white rounded-br-md`
                      : 'bg-white shadow-sm border border-[#e8e4df] rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                        className="mt-2 text-[#6b6b6b] hover:text-[#ee5a5a] transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border border-[#e8e4df] px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#d4c4b5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[#d4c4b5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[#d4c4b5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <div className="bg-white border-t border-[#e8e4df]">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-3 rounded-xl transition flex-shrink-0 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#f8f6f3] text-[#6b6b6b] hover:bg-[#f0ece7]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              className="flex-1 px-4 py-3 border-[1.5px] border-[#e8e4df] rounded-xl focus:ring-0 focus:border-[#ee5a5a] transition-all bg-white"
              disabled={loading || isListening}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`px-4 py-3 bg-gradient-to-r ${currentModeConfig.color} text-white rounded-xl transition disabled:opacity-50 hover:shadow-lg flex-shrink-0`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-[#6b6b6b] mt-3 text-center">AI coaching assistant • For mental health support, consult a professional</p>
        </form>
      </div>
    </div>
  )
}

export default function CoachPage() {
  return (
    <Suspense fallback={
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
    }>
      <CoachContent />
    </Suspense>
  )
}
