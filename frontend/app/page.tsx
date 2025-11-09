'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { SecretSantaForm } from '@/components/secret-santa/participant-form'
import { ResultsDisplay } from '@/components/secret-santa/results-display'
import { SecretSantaResponse } from '@/lib/types'

// Snowflake component for falling animation
function Snowflake({ delay = 0, index = 0 }: { delay?: number; index?: number }) {
  // Use deterministic positioning based on index to avoid hydration mismatch
  const leftPosition = ((index * 7.3 + 13) % 100) // Creates varied but deterministic positions
  const duration = 3 + ((index * 1.7) % 2) // Creates varied but deterministic durations

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

export default function Home() {
  const [results, setResults] = useState<SecretSantaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = () => {
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Snowfall Animation - Layer 0 (Deepest) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <Snowflake key={i} delay={i * 0.5} index={i} />
        ))}
      </div>

      {/* Background Gradient Layer - Layer 1 */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 via-transparent to-blue-300/10" />
      </div>

      <main className="relative z-10">
        {!results ? (
          <>
            {/* System of Boxes: Hero Section (Box 1 - Deepest background layer) */}
            <div className="min-h-screen flex flex-col">
              {/* Hero Content Box (Box 2 - Elevated content area) */}
              <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
                <div className="text-center max-w-5xl mx-auto w-full">
                  {/* Icon Container (Box 3 - Most elevated element) */}
                  <div className="flex justify-center mb-6 lg:mb-8">
                    <div className="relative">
                      {/* Outer glow effect */}
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                      {/* Elevated icon container with gradient and shadow */}
                      <div className="relative bg-gradient-to-br from-red-100 to-red-300/30 p-6 lg:p-8 rounded-full shadow-prominent animate-bounce-gift backdrop-blur-sm">
                        <Gift className="h-12 w-12 lg:h-16 lg:w-16 text-primary drop-shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Text Content Box (Box 3 - Elevated text area) */}
                  <div className="space-y-4 lg:space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-700 bg-clip-text text-transparent drop-shadow-sm">
                      Secret Santa Generator
                    </h1>

                    {/* Decorative divider with depth */}
                    <div className="flex items-center justify-center gap-3 px-8">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-subtle" />
                      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-standard" />
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-subtle" />
                    </div>

                    <p className="text-lg sm:text-xl lg:text-2xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
                      Create magical gift exchanges with advanced pairing options
                    </p>
                  </div>

                  {/* Trust Indicators Grid (Box 3 - Elevated feature cards) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-8 lg:mt-12 max-w-4xl mx-auto">
                    {[
                      { label: 'No registration', icon: '✓' },
                      { label: 'Free forever', icon: '✓' },
                      { label: 'Email delivery', icon: '✓' },
                      { label: '100% private', icon: '✓' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl bg-card shadow-subtle hover:shadow-standard transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center shadow-button group-hover:shadow-button-hover transition-all duration-300">
                          <span className="text-white text-sm lg:text-base font-bold drop-shadow">{item.icon}</span>
                        </div>
                        <span className="text-xs lg:text-sm text-neutral-700 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Section Box (Box 2 - Main interactive area) */}
              <div className="container mx-auto px-4 pb-12 lg:pb-16 max-w-7xl">
                {/* Form wrapper with elevated background */}
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-standard p-4 lg:p-8">
                  <SecretSantaForm
                    onResults={setResults}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Results Section Box (Box 2 - Elevated results area) */
          <div className="container mx-auto px-4 py-12 lg:py-16 max-w-5xl">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-prominent p-4 lg:p-8">
              <ResultsDisplay
                results={results}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* Footer Box (Box 1 - Base layer) */}
        {!results && (
          <div className="text-center py-6 lg:py-8 text-sm text-neutral-700">
            <p className="drop-shadow-sm">Built with ❤️ for making gift exchanges magical</p>
          </div>
        )}
      </main>
    </div>
  )
}
