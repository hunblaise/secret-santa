'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { SecretSantaForm } from '@/components/secret-santa/participant-form'
import { ResultsDisplay } from '@/components/secret-santa/results-display'
import { SecretSantaResponse } from '@/lib/types'

// Snowflake component for falling animation
function Snowflake({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="snowflake animate-snowfall text-2xl absolute"
      style={{ 
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`
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
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      {/* Snowfall Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <Snowflake key={i} delay={i * 0.5} />
        ))}
      </div>

      <main className="relative z-10">
        {!results ? (
          <>
            {/* Hero Section */}
            <div className="min-h-screen flex flex-col">
              {/* Hero Content */}
              <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-4xl mx-auto">
                  {/* Animated Gift Icon */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-primary/10 p-8 rounded-full animate-bounce-gift">
                      <Gift className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  
                  {/* Hero Text */}
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                    Secret Santa Generator
                  </h1>
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6"></div>
                  <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Create magical gift exchanges with advanced pairing options
                  </p>
                  
                  {/* Trust Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-xs">✓</span>
                      </div>
                      <span>No registration</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-xs">✓</span>
                      </div>
                      <span>Free forever</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-xs">✓</span>
                      </div>
                      <span>Email delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-xs">✓</span>
                      </div>
                      <span>100% private</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="container mx-auto px-4 pb-16 max-w-6xl">
                <SecretSantaForm 
                  onResults={setResults} 
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <ResultsDisplay 
              results={results} 
              onReset={handleReset}
            />
          </div>
        )}

        {/* Footer */}
        {!results && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>Built with ❤️ for making gift exchanges magical</p>
          </div>
        )}
      </main>
    </div>
  )
}
