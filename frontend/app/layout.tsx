import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Secret Santa Generator - Create Perfect Gift Exchanges',
  description: 'Generate Secret Santa pairs with exclusions, forced pairings, and automatic email delivery.',
  keywords: 'secret santa, gift exchange, random pairs, christmas, holiday',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  manifest: '/site.webmanifest',
  themeColor: '#DA2C38',
  openGraph: {
    title: 'Secret Santa Generator',
    description: 'Generate perfect Secret Santa pairs with advanced options',
    images: ['/yeti-santa.png'],
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
