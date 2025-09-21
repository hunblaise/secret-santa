'use client'

import React, { useMemo } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import validator from 'validator'

import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface EnhancedEmailInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function EnhancedEmailInput({ value, onChange, placeholder, className }: EnhancedEmailInputProps) {
  // Parse and validate emails in real-time
  const emailValidation = useMemo(() => {
    if (!value?.trim()) {
      return { 
        lines: [], 
        validCount: 0, 
        invalidCount: 0, 
        duplicateCount: 0,
        errors: []
      }
    }

    const lines = value.split('\n').map((line, index) => {
      const email = line.trim()
      const lineNumber = index + 1
      
      if (!email) {
        return { lineNumber, email, status: 'empty' as const }
      }

      const isValid = validator.isEmail(email)
      return { 
        lineNumber, 
        email, 
        status: isValid ? 'valid' as const : 'invalid' as const 
      }
    }).filter(line => line.email) // Remove empty lines for counting

    // Check for duplicates
    const emailCounts = lines.reduce((acc, line) => {
      if (line.status === 'valid') {
        acc[line.email] = (acc[line.email] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const linesWithDuplicates = lines.map(line => ({
      ...line,
      status: line.status === 'valid' && emailCounts[line.email] > 1 
        ? 'duplicate' as const 
        : line.status
    }))

    const validCount = linesWithDuplicates.filter(l => l.status === 'valid').length
    const invalidCount = linesWithDuplicates.filter(l => l.status === 'invalid').length
    const duplicateCount = linesWithDuplicates.filter(l => l.status === 'duplicate').length

    const errors: string[] = []
    if (invalidCount > 0) {
      const invalidLines = linesWithDuplicates
        .filter(l => l.status === 'invalid')
        .map(l => `Line ${l.lineNumber}`)
        .slice(0, 3) // Show max 3 examples
      
      errors.push(`Invalid email format: ${invalidLines.join(', ')}${invalidCount > 3 ? ` and ${invalidCount - 3} more` : ''}`)
    }
    
    if (duplicateCount > 0) {
      errors.push(`${duplicateCount} duplicate email${duplicateCount !== 1 ? 's' : ''} found`)
    }

    return {
      lines: linesWithDuplicates,
      validCount,
      invalidCount,
      duplicateCount,
      errors
    }
  }, [value])

  // Generate the visual representation - only show icons on the right side
  const renderEmailIcons = () => {
    if (!value?.trim()) return null

    return (
      <div className="absolute inset-0 pointer-events-none z-10 font-mono text-sm p-3">
        {value.split('\n').map((line, index) => {
          const email = line.trim()
          const lineData = emailValidation.lines.find(l => l.lineNumber === index + 1)

          if (!email) {
            return <div key={index} className="h-5" />
          }

          const getStatusIcon = () => {
            if (!lineData) return null

            switch (lineData.status) {
              case 'valid':
                return <Check className="h-3 w-3 text-green-500" />
              case 'invalid':
                return <X className="h-3 w-3 text-red-500" />
              case 'duplicate':
                return <AlertTriangle className="h-3 w-3 text-amber-500" />
              default:
                return null
            }
          }

          return (
            <div key={index} className="flex items-center h-5 justify-end pr-2">
              <div className="flex items-center">
                {getStatusIcon()}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <FormItem>
      <FormLabel className="flex items-center justify-between">
        <span>Email Addresses</span>
        <div className="flex items-center gap-2">
          {emailValidation.validCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              {emailValidation.validCount} valid
            </Badge>
          )}
          {emailValidation.invalidCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              <X className="h-3 w-3 mr-1" />
              {emailValidation.invalidCount} invalid
            </Badge>
          )}
          {emailValidation.duplicateCount > 0 && (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {emailValidation.duplicateCount} duplicate
            </Badge>
          )}
        </div>
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Textarea
            placeholder={placeholder}
            className={`min-h-[120px] font-mono text-sm relative z-20 resize-none ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ lineHeight: '1.25rem' }} // 20px line height for h-5
          />
          {renderEmailIcons()}
        </div>
      </FormControl>
      <div className="flex items-center justify-between">
        <FormDescription>
          Enter one email address per line • {emailValidation.validCount} valid participants
        </FormDescription>
        <Badge variant={emailValidation.validCount >= 3 ? "success" : "destructive"}>
          {emailValidation.validCount} participant{emailValidation.validCount !== 1 ? 's' : ''}
        </Badge>
      </div>
      {emailValidation.errors.length > 0 && (
        <div className="space-y-1">
          {emailValidation.errors.map((error, index) => (
            <FormMessage key={index}>{error}</FormMessage>
          ))}
        </div>
      )}
    </FormItem>
  )
}