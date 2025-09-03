'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Settings } from 'lucide-react'
import { FormData } from '@/lib/types'

interface AdvancedOptionsProps {
  form: UseFormReturn<FormData>
  emailsText: string
}

export function AdvancedOptions({ form, emailsText }: AdvancedOptionsProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Advanced options (exclusions, forced pairings, name mappings) coming in Step 4!</p>
      <p className="text-sm mt-2">For now, enjoy the basic Secret Santa generator.</p>
    </div>
  )
}