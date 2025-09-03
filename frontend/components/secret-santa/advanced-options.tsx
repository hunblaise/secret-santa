'use client'

import React from 'react'
import { Settings } from 'lucide-react'

interface AdvancedOptionsProps {
  form?: unknown
  emailsText?: string
}

export function AdvancedOptions({ }: AdvancedOptionsProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Advanced options (exclusions, forced pairings, name mappings) coming in Step 4!</p>
      <p className="text-sm mt-2">For now, enjoy the basic Secret Santa generator.</p>
    </div>
  )
}