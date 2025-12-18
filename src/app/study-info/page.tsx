'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudyInfoPage() {
  const [hasRead, setHasRead] = useState(false)
  const router = useRouter()

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
            <div className="w-8 h-8 bg-[#e0f2fe] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#2d2d2d]" style={{ fontFamily: 'var(--font-heading)' }}>
              Participant Information Sheet
            </h1>
          </div>
          
          <p className="text-xs text-[#6b6b6b] mb-6 pb-4 border-b border-[#e8e4df]">
            Version 1.0 • Please read this information carefully before deciding to participate
          </p>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Study Title</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                Evaluation of a Positive Health Coaching Digital Application
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Researcher(s)</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                [Researcher Name]<br />
                [Institution/University]<br />
                [Department]
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Ethics Approval</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                This study has been approved by [Ethics Board Name].<br />
                Approval Reference: [Approval Number]
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">What is this study about?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                This study evaluates a digital wellbeing application based on positive psychology 
                principles. The app includes guided interventions, goal setting, journaling, and 
                AI-assisted coaching to support your mental health and wellbeing. We want to 
                understand how people use the app and whether it helps improve wellbeing.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Why have I been invited?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                You have been invited because you expressed interest in participating in this 
                research study and meet our inclusion criteria (aged 18 or over).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Do I have to take part?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                No. Participation is entirely voluntary. You can withdraw at any time without 
                giving a reason. Withdrawing will not affect you in any way.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">What will I be asked to do?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                If you agree to participate, you will:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1 list-disc list-inside">
                <li>Use the Positive Health Coach app for [X weeks]</li>
                <li>Complete wellbeing activities and interventions</li>
                <li>Optionally use the AI coaching feature</li>
                <li>Set personal goals and track your progress</li>
                <li>Optionally write journal entries</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">What data will be collected?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                The app will collect:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1 list-disc list-inside">
                <li>Your responses to wellbeing interventions</li>
                <li>Mood ratings before and after activities</li>
                <li>Goals you set and their progress</li>
                <li>Journal entries you choose to write</li>
                <li>Conversations with the AI coach</li>
                <li>App usage patterns (which features you use)</li>
              </ul>
              <p className="text-[#6b6b6b] mt-2 leading-relaxed">
                <strong>We do NOT collect:</strong> Your name, email address, phone number, 
                location data, or any other personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">How is my data protected?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                Your privacy is our priority. We protect your data by:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1 list-disc list-inside">
                <li><strong>Pseudonymization:</strong> Your data is stored under a participant ID only (e.g., PHC001). Your identity cannot be determined from the app data alone.</li>
                <li><strong>EU Data Storage:</strong> All data is stored on secure servers in the European Union (AWS Frankfurt, Germany), in compliance with GDPR.</li>
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest.</li>
                <li><strong>Limited Access:</strong> Only the research team can access the data.</li>
                <li><strong>Separate Storage:</strong> The link between your participant ID and your identity is kept in a separate, encrypted file accessible only to the lead researcher.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">How long will my data be kept?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                Your data will be retained for [X years] after the study ends, in accordance 
                with research data management policies. After this period, all data will be 
                securely deleted. Anonymized data may be retained for longer for research purposes.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Your Rights Under GDPR</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                Under the General Data Protection Regulation (GDPR), you have the right to:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1 list-disc list-inside">
                <li><strong>Access:</strong> Request a copy of your data at any time</li>
                <li><strong>Rectification:</strong> Correct any inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Withdraw Consent:</strong> Stop participating at any time</li>
                <li><strong>Complain:</strong> Lodge a complaint with the Data Protection Commission</li>
              </ul>
              <p className="text-[#6b6b6b] mt-2 leading-relaxed">
                To exercise any of these rights, contact the researcher using the details below.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Are there any risks?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                This app is designed to support wellbeing and uses evidence-based positive 
                psychology techniques. However:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1 list-disc list-inside">
                <li>Some reflection activities may bring up difficult emotions</li>
                <li>The AI coach is not a replacement for professional mental health support</li>
                <li>If you experience distress, please contact a healthcare professional</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">What are the benefits?</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                Potential benefits include learning positive psychology techniques, improved 
                self-awareness, and contributing to research that may help others. However, 
                we cannot guarantee any specific benefits to you personally.
              </p>
            </section>

            <section className="bg-[#fef3eb] p-4 rounded-xl">
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Important: Crisis Support</h2>
              <p className="text-[#6b6b6b] leading-relaxed">
                This app is NOT a crisis service. If you are experiencing a mental health 
                emergency, please contact:
              </p>
              <ul className="text-[#6b6b6b] mt-2 space-y-1">
                <li><strong>Ireland:</strong> Samaritans 116 123 (free, 24/7)</li>
                <li><strong>UK:</strong> Samaritans 116 123 (free, 24/7)</li>
                <li><strong>Emergency:</strong> 999 / 112</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[#2d2d2d] mb-2">Contact Information</h2>
              <div className="text-[#6b6b6b] leading-relaxed space-y-2">
                <p>
                  <strong>Lead Researcher:</strong><br />
                  [Name]<br />
                  [Email]<br />
                  [Phone - optional]
                </p>
                <p>
                  <strong>Data Protection Officer:</strong><br />
                  [Name/Office]<br />
                  [Email]
                </p>
                <p>
                  <strong>Ethics Committee:</strong><br />
                  [Committee Name]<br />
                  [Email]
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-[#d4c4b5] text-[#ee5a5a] focus:ring-[#ee5a5a]"
            />
            <span className="text-[#2d2d2d] text-sm leading-relaxed">
              I confirm that I have read and understood this Participant Information Sheet.
            </span>
          </label>

          <button
            onClick={() => router.push('/consent')}
            disabled={!hasRead}
            className={`w-full py-4 rounded-xl font-semibold text-white transition ${
              hasRead
                ? 'bg-gradient-to-r from-[#ee5a5a] to-[#d94848] hover:shadow-lg'
                : 'bg-[#d4c4b5] cursor-not-allowed'
            }`}
          >
            Continue to Consent Form
          </button>
        </div>
      </main>
    </div>
  )
}
