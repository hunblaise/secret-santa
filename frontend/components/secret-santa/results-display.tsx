'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Gift, RotateCcw, Download, Copy, ArrowRight, Sparkles } from 'lucide-react'

import { SecretSantaResponse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Confetti component for celebration
function Confetti({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="absolute animate-confetti text-xl"
      style={{ 
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random()}s`
      }}
    >
      {['🎁', '🎄', '⭐', '❄️', '🎅'][Math.floor(Math.random() * 5)]}
    </div>
  )
}

interface ResultsDisplayProps {
  results: SecretSantaResponse
  onReset: () => void
  celebrationDuration?: number
}

export function ResultsDisplay({ results, onReset, celebrationDuration = 4000 }: ResultsDisplayProps) {
  const { toast } = useToast()
  const [showCelebration, setShowCelebration] = useState(false)

  // Trigger celebration animation on mount if successful
  useEffect(() => {
    const isSuccess = results.pairs.length > 0 && results.errors.length === 0
    if (isSuccess) {
      setShowCelebration(true)
      const timeout = setTimeout(() => setShowCelebration(false), celebrationDuration)
      return () => clearTimeout(timeout)
    }
  }, [results, celebrationDuration])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'default'
      case 'FAILED': return 'destructive'
      case 'PARTIAL': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusIcon = () => {
    const hasErrors = results.errors.length > 0
    const success = results.pairs.length > 0 && !hasErrors
    
    if (success) return <CheckCircle className="h-8 w-8 text-secondary animate-pulse-success" />
    if (hasErrors) return <XCircle className="h-8 w-8 text-destructive" />
    return <AlertCircle className="h-8 w-8 text-amber-500" />
  }

  const handleCopyPairs = async () => {
    const pairsText = results.pairs
      .map(pair => `${pair.from} → ${pair.to}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(pairsText)
      toast({
        title: "Copied!",
        description: "Pairs copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy pairs",
        variant: "destructive",
      })
    }
  }

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `secret-santa-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="relative">
      {/* Celebration Confetti */}
      {showCelebration && (
        <div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          data-testid="celebration-confetti"
        >
          {Array.from({ length: 30 }, (_, i) => (
            <Confetti key={i} delay={i * 0.1} />
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Success Header */}
        <Card className={`${showCelebration ? 'success-celebration' : ''}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              ✨ Secret Santa Pairs Generated! ✨
            </CardTitle>
            <CardDescription className="text-lg">
              Successfully created {results.pairs.length} magical assignments
            </CardDescription>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">
                  Generated at {new Date(results.timestamp).toLocaleString()}
                </p>
              </div>
              {results.emailStatus !== 'DISABLED' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">Email Status:</span>
                  <Badge variant={getStatusVariant(results.emailStatus)}>
                    {results.emailStatus}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Pairs Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Secret Santa Assignments
            </CardTitle>
            <CardDescription>
              Here are your Secret Santa pair assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.pairs.map((pair, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium">{pair.from}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{pair.to}</span>
                    </div>
                    {results.emailResults[pair.from] && (
                      <Badge variant={getStatusVariant(results.emailResults[pair.from])}>
                        {results.emailResults[pair.from]}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Results */}
        {results.emailStatus !== 'DISABLED' && Object.keys(results.emailResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Status</CardTitle>
              <CardDescription>
                Individual email delivery results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(results.emailResults).map(([email, status]) => (
                  <div key={email} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm font-mono">{email}</span>
                    <Badge variant={getStatusVariant(status)}>
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Messages */}
        {results.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Issues Found</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {results.errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Generate New Pairs
              </Button>
              
              <Button
                onClick={handleCopyPairs}
                variant="outline"
                size="lg"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Pairs
              </Button>
              
              <Button
                onClick={handleDownloadJSON}
                variant="outline"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
