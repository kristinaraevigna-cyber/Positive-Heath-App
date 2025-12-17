// src/app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e4df] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Positive Health Coach
            </span>
          </div>
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:from-[#d94848] hover:to-[#b73a3a] transition-all font-medium shadow-md shadow-[#ee5a5a]/20"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Heart Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-3xl flex items-center justify-center shadow-lg shadow-[#ee5a5a]/30 heart-pulse">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl text-[#2d2d2d] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Your Partner in<br />
              <span className="text-[#ee5a5a]">Positive Health</span>
            </h2>
            
            <p className="text-xl text-[#6b6b6b] mb-10 leading-relaxed">
              Evidence-based coaching for your physical, mental, and social health. 
              Powered by positive psychology and lifestyle medicine research.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-[#ee5a5a] to-[#d94848] text-white rounded-xl hover:from-[#d94848] hover:to-[#b73a3a] transition-all font-semibold shadow-lg shadow-[#ee5a5a]/30 hover:shadow-xl hover:shadow-[#ee5a5a]/40 hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white border-2 border-[#e8e4df] text-[#5f7360] rounded-xl hover:bg-[#f6f7f6] hover:border-[#c7d0c7] transition-all font-semibold"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Feature highlights */}
          <div id="features" className="mt-24 grid md:grid-cols-3 gap-6">
            {/* AI Coaching Card */}
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] hover:border-[#fecaca] hover:shadow-lg hover:shadow-[#ee5a5a]/5 transition-all group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-[#ee5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#2d2d2d] text-lg mb-3 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                AI Health Coaching
              </h3>
              <p className="text-[#6b6b6b] text-center leading-relaxed">
                24/7 access to your personal health coach for guidance, support, and accountability on your journey.
              </p>
            </div>

            {/* Interventions Card */}
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] hover:border-[#c7d0c7] hover:shadow-lg hover:shadow-[#5f7360]/5 transition-all group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e3e7e3] to-[#c7d0c7] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#2d2d2d] text-lg mb-3 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                15 Micro-Interventions
              </h3>
              <p className="text-[#6b6b6b] text-center leading-relaxed">
                Research-backed activities for calming, energising, coping, and building meaningful connections.
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] hover:border-[#e8ddd3] hover:shadow-lg hover:shadow-[#a68b72]/5 transition-all group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#f5f0eb] to-[#e8ddd3] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-[#7a6150]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#2d2d2d] text-lg mb-3 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                Track Your Progress
              </h3>
              <p className="text-[#6b6b6b] text-center leading-relaxed">
                Monitor your health journey with streaks, mood tracking, and personalized insights.
              </p>
            </div>
          </div>

          {/* Research Badge */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-[#e8e4df]">
              <svg className="w-5 h-5 text-[#5f7360]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <span className="text-[#6b6b6b] text-sm">
                Based on research from <span className="font-semibold text-[#2d2d2d]">Burke et al. (2023)</span> — RCSI Centre for Positive Psychology and Health
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e8e4df] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-[#ee5a5a] to-[#d94848] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="font-semibold text-[#2d2d2d]">Positive Health Coach</span>
            </div>
            <p className="text-[#6b6b6b] text-sm">
              © 2025 Positive Health Coach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}