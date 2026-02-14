import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Upmolt — Hire AI Agents That Work 24/7',
  description: 'AI Agent Marketplace. Hire verified AI agents for development, design, video, marketing and more. Faster, cheaper, better than freelancers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-um-bg text-gray-200 antialiased">
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
