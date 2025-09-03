'use client'

import React from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Plus, Trash2, Users, Heart, Ban } from 'lucide-react'

import { FormData } from '@/lib/types'
import { parseEmails } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AdvancedOptionsProps {
  form: UseFormReturn<FormData>
  emailsText: string
}

export function AdvancedOptions({ form, emailsText }: AdvancedOptionsProps) {
  const emails = parseEmails(emailsText)

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

  const addExclusion = () => {
    appendExclusion({
      id: Math.random().toString(36),
      from: '',
      to: '',
    })
  }

  const addForcedPairing = () => {
    appendForcedPairing({
      id: Math.random().toString(36),
      from: '',
      to: '',
    })
  }

  const addNameMapping = () => {
    appendNameMapping({
      id: Math.random().toString(36),
      email: '',
      name: '',
    })
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  onClick={() => removeExclusion(index)}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  onClick={() => removeForcedPairing(index)}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  onClick={() => removeNameMapping(index)}
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