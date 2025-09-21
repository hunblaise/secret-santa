'use client'

import React, { useMemo, useCallback } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
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
  form: UseFormReturn<FormData>
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

  if (!form) {
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

  const {
    fields: exclusionFields,
    append: appendExclusion,
    remove: removeExclusion,
  } = useFieldArray({
    control: form.control,
    name: 'exclusions',
  })

  const {
    fields: forcedPairingFields,
    append: appendForcedPairing,
    remove: removeForcedPairing,
  } = useFieldArray({
    control: form.control,
    name: 'forcedPairings',
  })

  const {
    fields: nameMappingFields,
    append: appendNameMapping,
    remove: removeNameMapping,
  } = useFieldArray({
    control: form.control,
    name: 'nameMappings',
  })

  // Validation helpers
  const validateNewExclusion = useCallback((from: string, to: string, currentIndex?: number): string | null => {
    if (from === to) return "You cannot exclude someone from themselves"

    const existing = exclusionFields.find(field => {
      const idx = exclusionFields.indexOf(field)
      // Skip validation against the current field being edited
      if (currentIndex !== undefined && idx === currentIndex) return false
      return form.getValues(`exclusions.${idx}.from`) === from &&
             form.getValues(`exclusions.${idx}.to`) === to
    })
    if (existing) return "This exclusion already exists"

    const conflictingPairing = forcedPairingFields.find(field => {
      const idx = forcedPairingFields.indexOf(field)
      return form.getValues(`forcedPairings.${idx}.from`) === from &&
             form.getValues(`forcedPairings.${idx}.to`) === to
    })
    if (conflictingPairing) return "This conflicts with an existing forced pairing"

    return null
  }, [exclusionFields, forcedPairingFields, form])
  
  const validateNewForcedPairing = useCallback((from: string, to: string, currentIndex?: number): string | null => {
    if (from === to) return "You cannot force someone to pair with themselves"

    const existing = forcedPairingFields.find(field => {
      const idx = forcedPairingFields.indexOf(field)
      // Skip validation against the current field being edited
      if (currentIndex !== undefined && idx === currentIndex) return false
      return form.getValues(`forcedPairings.${idx}.from`) === from &&
             form.getValues(`forcedPairings.${idx}.to`) === to
    })
    if (existing) return "This forced pairing already exists"

    const conflictingExclusion = exclusionFields.find(field => {
      const idx = exclusionFields.indexOf(field)
      return form.getValues(`exclusions.${idx}.from`) === from &&
             form.getValues(`exclusions.${idx}.to`) === to
    })
    if (conflictingExclusion) return "This conflicts with an existing exclusion"

    return null
  }, [exclusionFields, forcedPairingFields, form])

  const validateNewNameMapping = useCallback((email: string, currentIndex: number): string | null => {
    if (!email) return null
    
    const duplicate = nameMappingFields.find((field, idx) => {
      if (idx === currentIndex) return false
      return form.getValues(`nameMappings.${idx}.email`) === email
    })
    if (duplicate) return "This email already has a name mapping"
    
    return null
  }, [nameMappingFields, form])

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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="exclusions" className="flex items-center gap-2">
          <Ban className="h-4 w-4" />
          Exclusions
        </TabsTrigger>
        <TabsTrigger value="forced" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Forced Pairs
        </TabsTrigger>
        <TabsTrigger value="names" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Name Mapping
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
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`exclusions.${index}.from`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const toValue = form.getValues(`exclusions.${index}.to`)
                        if (value && toValue) {
                          const error = validateNewExclusion(value, toValue, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                
                <div className="text-muted-foreground pb-2">cannot give to</div>
                
                <FormField
                  control={form.control}
                  name={`exclusions.${index}.to`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const fromValue = form.getValues(`exclusions.${index}.from`)
                        if (fromValue && value) {
                          const error = validateNewExclusion(fromValue, value, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`forcedPairings.${index}.from`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const toValue = form.getValues(`forcedPairings.${index}.to`)
                        if (value && toValue) {
                          const error = validateNewForcedPairing(value, toValue, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                
                <div className="text-muted-foreground pb-2">must give to</div>
                
                <FormField
                  control={form.control}
                  name={`forcedPairings.${index}.to`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value)
                        // Validate on change
                        const fromValue = form.getValues(`forcedPairings.${index}.from`)
                        if (fromValue && value) {
                          const error = validateNewForcedPairing(fromValue, value, index)
                          if (error) {
                            toast({ title: "Validation Error", description: error, variant: "destructive" })
                          }
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`nameMappings.${index}.email`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
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
                          <SelectTrigger>
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
                  control={form.control}
                  name={`nameMappings.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
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
