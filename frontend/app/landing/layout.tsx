import type { Metadata } from 'next'

// SEO Metadata for Landing Page
export const metadata: Metadata = {
  title: 'Secret Santa Generator | Fair & Easy Gift Exchange Tool',
  description: 'Create perfect Secret Santa pairs with our smart algorithm. Handle exclusions, send emails automatically, and ensure everyone gets matched fairly. Free and instant!',
  keywords: [
    'secret santa generator',
    'gift exchange',
    'secret santa online',
    'christmas gift exchange',
    'secret santa maker',
    'secret santa name picker',
    'holiday gift exchange',
    'white elephant generator',
    'secret santa pairing',
    'fair secret santa'
  ].join(', '),
  openGraph: {
    title: 'Secret Santa Generator | Fair & Easy Gift Exchange',
    description: 'Generate perfect Secret Santa pairs instantly with our smart algorithm. Handle constraints, send emails automatically, and ensure fairness.',
    type: 'website',
    images: [
      {
        url: '/yeti-santa.png',
        width: 1200,
        height: 630,
        alt: 'Secret Santa Generator with Yeti Mascot'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Santa Generator | Fair & Easy',
    description: 'Create perfect Secret Santa pairs instantly. Smart algorithm, constraint handling, and automatic emails.',
    images: ['/yeti-santa.png'],
  },
  alternates: {
    canonical: '/landing'
  }
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
