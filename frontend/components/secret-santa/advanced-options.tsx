'use client'

import React, { useMemo, useCallback } from 'react'
import { useFieldArray, UseFormReturn, useForm } from 'react-hook-form'
import { Plus, Trash2, Users, Heart, Ban, AlertTriangle } from 'lucide-react'

import { FormData } from '@/lib/types'
import { parseEmails } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdvancedOptionsProps {
  form: UseFormReturn<FormData> | null
  emailsText: string
}

// Secure ID generation utility
function generateSecureId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function AdvancedOptions({ form, emailsText }: AdvancedOptionsProps) {
  const { toast } = useToast()

  // Memoize email parsing for performance
  const emails = useMemo(() => {
    if (!emailsText?.trim()) return []
    return parseEmails(emailsText)
  }, [emailsText])

  // Provide a stable fallback form when no form instance is supplied
  const fallbackForm = useForm<FormData>({
    defaultValues: {
      emailsText: '',
      sendEmails: false,
      exclusions: [],
      forcedPairings: [],
      nameMappings: [],
    },
  })

  const activeForm = form ?? fallbackForm
  const isFallbackForm = form == null


  // Move all hooks to top before any conditional returns
  const {
    fields: exclusionFields,
    append: appendExclusion,
    remove: removeExclusion,
  } = useFieldArray({
    control: activeForm.control,
    name: 'exclusions',
  })

  const {
    fields: forcedPairingFields,
    append: appendForcedPairing,
    remove: removeForcedPairing,
  } = useFieldArray({
    control: activeForm.control,
    name: 'forcedPairings',
  })

  const {
    fields: nameMappingFields,
    append: appendNameMapping,
    remove: removeNameMapping,
  } = useFieldArray({
    control: activeForm.control,
    name: 'nameMappings',
  })

  // Move all useCallback hooks to top before any conditional returns
  // Validation helpers
  const validateNewExclusion = useCallback((from: string, to: string, currentIndex?: number): string | null => {
    if (isFallbackForm) return null
    if (from === to) return "You cannot exclude someone from themselves"

    const existing = exclusionFields.find(field => {
      const idx = exclusionFields.indexOf(field)
      // Skip validation against the current field being edited
      if (currentIndex !== undefined && idx === currentIndex) return false
      return activeForm.getValues(`exclusions.${idx}.from`) === from &&
             activeForm.getValues(`exclusions.${idx}.to`) === to
    })
    if (existing) return "This exclusion already exists"

    const conflictingPairing = forcedPairingFields.find(field => {
      const idx = forcedPairingFields.indexOf(field)
      return activeForm.getValues(`forcedPairings.${idx}.from`) === from &&
             activeForm.getValues(`forcedPairings.${idx}.to`) === to
    })
    if (conflictingPairing) return "This conflicts with an existing forced pairing"

    return null
  }, [activeForm, exclusionFields, forcedPairingFields, isFallbackForm])
  
  const validateNewForcedPairing = useCallback((from: string, to: string, currentIndex?: number): string | null => {
    if (isFallbackForm) return null
    if (from === to) return "You cannot force someone to pair with themselves"

    const existing = forcedPairingFields.find(field => {
      const idx = forcedPairingFields.indexOf(field)
      // Skip validation against the current field being edited
      if (currentIndex !== undefined && idx === currentIndex) return false
      return activeForm.getValues(`forcedPairings.${idx}.from`) === from &&
             activeForm.getValues(`forcedPairings.${idx}.to`) === to
    })
    if (existing) return "This forced pairing already exists"

    const conflictingExclusion = exclusionFields.find(field => {
      const idx = exclusionFields.indexOf(field)
      return activeForm.getValues(`exclusions.${idx}.from`) === from &&
             activeForm.getValues(`exclusions.${idx}.to`) === to
    })
    if (conflictingExclusion) return "This conflicts with an existing exclusion"

    return null
  }, [activeForm, exclusionFields, forcedPairingFields, isFallbackForm])

  const validateNewNameMapping = useCallback((email: string, currentIndex: number): string | null => {
    if (isFallbackForm) return null
    if (!email) return null

    const duplicate = nameMappingFields.find((field, idx) => {
      if (idx === currentIndex) return false
      return activeForm.getValues(`nameMappings.${idx}.email`) === email
    })
    if (duplicate) return "This email already has a name mapping"

    return null
  }, [activeForm, isFallbackForm, nameMappingFields])

  const addExclusion = useCallback(() => {
    appendExclusion({
      id: generateSecureId(),
      from: '',
      to: '',
    })
  }, [appendExclusion])

  const addForcedPairing = useCallback(() => {
    appendForcedPairing({
      id: generateSecureId(),
      from: '',
      to: '',
    })
  }, [appendForcedPairing])

  const addNameMapping = useCallback(() => {
    appendNameMapping({
      id: generateSecureId(),
      email: '',
      name: '',
    })
  }, [appendNameMapping])
  
  // Enhanced removal with validation
  const handleRemoveExclusion = useCallback((index: number) => {
    removeExclusion(index)
    toast({ title: "Exclusion removed" })
  }, [removeExclusion, toast])
  
  const handleRemoveForcedPairing = useCallback((index: number) => {
    removeForcedPairing(index) 
    toast({ title: "Forced pairing removed" })
  }, [removeForcedPairing, toast])
  
  const handleRemoveNameMapping = useCallback((index: number) => {
    removeNameMapping(index)
    toast({ title: "Name mapping removed" })
  }, [removeNameMapping, toast])

  // Handle null form case after all hooks are called
  if (isFallbackForm) {
    console.error('AdvancedOptions: form prop is required')
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Form configuration error. Please refresh the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Enter participant emails first to configure advanced options</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="exclusions" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 h-auto sm:h-9 p-1">
        <TabsTrigger value="exclusions" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-1">
          <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Exclusions</span>
        </TabsTrigger>
        <TabsTrigger value="forced" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-1">
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Forced Pairs</span>
        </TabsTrigger>
        <TabsTrigger value="names" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-1">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Name Mapping</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="exclusions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exclusions</CardTitle>
            <CardDescription>
              Prevent specific participants from being paired together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exclusionFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                <FormField
                  control={activeForm.control}
                  name={`exclusions.${index}.from`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">From</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const toValue = activeForm.getValues(`exclusions.${index}.to`)
                        if (value && toValue) {
                          const error = validateNewExclusion(value, toValue, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select giver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-muted-foreground text-sm sm:pb-2 text-center sm:text-left">cannot give to</div>

                <FormField
                  control={activeForm.control}
                  name={`exclusions.${index}.to`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">To</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const fromValue = activeForm.getValues(`exclusions.${index}.from`)
                        if (fromValue && value) {
                          const error = validateNewExclusion(fromValue, value, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select receiver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveExclusion(index)}
                  aria-label={`Remove exclusion rule ${index + 1}`}
                  className="sm:mb-0 self-end sm:self-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addExclusion}
              className="w-full"
              aria-label="Add new exclusion rule"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Exclusion
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forced Pairings</CardTitle>
            <CardDescription>
              Guarantee specific participants are paired together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forcedPairingFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                <FormField
                  control={activeForm.control}
                  name={`forcedPairings.${index}.from`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">From</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const toValue = activeForm.getValues(`forcedPairings.${index}.to`)
                        if (value && toValue) {
                          const error = validateNewForcedPairing(value, toValue, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select giver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-muted-foreground text-sm sm:pb-2 text-center sm:text-left">must give to</div>

                <FormField
                  control={activeForm.control}
                  name={`forcedPairings.${index}.to`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">To</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const fromValue = activeForm.getValues(`forcedPairings.${index}.from`)
                        if (fromValue && value) {
                          const error = validateNewForcedPairing(fromValue, value, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select receiver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveForcedPairing(index)}
                  aria-label={`Remove forced pairing ${index + 1}`}
                  className="sm:mb-0 self-end sm:self-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addForcedPairing}
              className="w-full"
              aria-label="Add new forced pairing rule"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Forced Pairing
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="names" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Name Mapping</CardTitle>
            <CardDescription>
              Set display names for participants instead of showing emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nameMappingFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                <FormField
                  control={activeForm.control}
                  name={`nameMappings.${index}.email`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">Email</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        if (value) {
                          const error = validateNewNameMapping(value, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select email" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={activeForm.control}
                  name={`nameMappings.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-sm">Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveNameMapping(index)}
                  aria-label={`Remove name mapping ${index + 1}`}
                  className="sm:mb-0 self-end sm:self-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addNameMapping}
              className="w-full"
              aria-label="Add new name mapping"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Name Mapping
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
