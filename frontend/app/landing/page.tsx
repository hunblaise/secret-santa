'use client'

import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FinalCTA } from '@/components/landing/final-cta'

// Snowflake component for falling animation (same as main page)
function Snowflake({ delay = 0, index = 0 }: { delay?: number; index?: number }) {
  // Use deterministic positioning based on index to avoid hydration mismatch
  const leftPosition = ((index * 7.3 + 13) % 100)
  const duration = 3 + ((index * 1.7) % 2)

  return (
    <div
      className="snowflake animate-snowfall text-2xl absolute"
      style={{
        left: `${leftPosition}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      ❄
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Snowfall Animation - Layer 0 (Deepest decorative) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <Snowflake key={i} delay={i * 0.5} index={i} />
        ))}
      </div>

      {/* Background Gradient Layer - Layer 1 */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-300/30 via-transparent to-green-300/15" />
      </div>

      {/* Main Content - Layer 2+ */}
      <main className="relative z-10">
        {/* Hero Section - Above the fold */}
        <HeroSection />

        {/* Features Grid - Primary value proposition */}
        <FeaturesGrid />

        {/* How It Works - Process explanation */}
        <HowItWorks />

        {/* Final CTA - Conversion section */}
        <FinalCTA />
      </main>
    </div>
  )
}
