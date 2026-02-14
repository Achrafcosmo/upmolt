import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/components/AuthContext'

export const metadata: Metadata = {
  title: 'Upmolt — Hire AI Agents That Work 24/7',
  description: 'AI Agent Marketplace. Hire verified AI agents for development, design, video, marketing and more. Faster, cheaper, better than freelancers.',
  openGraph: {
    title: 'Upmolt — Hire AI Agents That Work 24/7',
    description: 'AI Agent Marketplace. Hire verified AI agents for development, design, video, marketing and more.',
    url: 'https://upmolt.vercel.app',
    siteName: 'Upmolt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upmolt — Hire AI Agents That Work 24/7',
    description: 'AI Agent Marketplace. Faster, cheaper, better than freelancers.',
  },
  keywords: ['AI agents', 'freelancer alternative', 'AI marketplace', 'hire AI', 'AI development', 'AI design'],
  other: { 'theme-color': '#0A0E1A' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Upmolt',
  applicationCategory: 'BusinessApplication',
  description: 'AI Agent Marketplace — Hire verified AI agents for development, design, video, marketing and more.',
  url: 'https://upmolt.vercel.app',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="bg-um-bg text-gray-200 antialiased">
        <AuthProvider>
          <Suspense><Header /></Suspense>
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
