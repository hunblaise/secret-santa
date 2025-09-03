'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { SecretSantaForm } from '@/components/secret-santa/participant-form'
import { ResultsDisplay } from '@/components/secret-santa/results-display'
import { SecretSantaResponse } from '@/lib/types'

export default function Home() {
  const [results, setResults] = useState<SecretSantaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = () => {
    setResults(null)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
            <Gift className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Secret Santa Generator
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Create magical gift exchanges with advanced pairing options
        </p>
      </div>

      {/* Main Content */}
      {!results ? (
        <SecretSantaForm 
          onResults={setResults} 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <ResultsDisplay 
          results={results} 
          onReset={handleReset}
        />
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>Built with ❤️ for making gift exchanges magical</p>
      </div>
    </main>
  )
}
