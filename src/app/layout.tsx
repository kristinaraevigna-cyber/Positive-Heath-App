// src/app/layout.tsx
import type { Metadata } from 'next'
import { Source_Sans_3, DM_Serif_Display } from 'next/font/google'
import './globals.css'

// Body font - clean and readable
const sourceSans = Source_Sans_3({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Heading font - elegant and warm
const dmSerif = DM_Serif_Display({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Positive Health Coach',
  description: 'Evidence-based coaching for physical, mental, and social wellbeing',
  keywords: ['health coaching', 'positive psychology', 'lifestyle medicine', 'wellbeing'],
  authors: [{ name: 'Positive Health Coach' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${dmSerif.variable}`}>
      <body className="font-body bg-gray-50 text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}