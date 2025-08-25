import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Secret Santa Generator - Create Perfect Gift Exchanges',
  description: 'Generate Secret Santa pairs with exclusions, forced pairings, and automatic email delivery.',
  keywords: 'secret santa, gift exchange, random pairs, christmas, holiday',
  openGraph: {
    title: 'Secret Santa Generator',
    description: 'Generate perfect Secret Santa pairs with advanced options',
    images: ['/santa-share.png'],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
