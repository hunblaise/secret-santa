'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Users, Mail, Settings, ChevronDown, ChevronUp } from 'lucide-react'

import { secretSantaApi } from '@/lib/api'
import { SecretSantaResponse, FormData } from '@/lib/types'
import { buildSecretSantaRequest, parseEmails } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AdvancedOptions } from './advanced-options'
import { EnhancedEmailInput } from './enhanced-email-input'

const formSchema = z.object({
  emailsText: z.string()
    .min(1, 'Please enter at least one email address')
    .refine((text) => {
      const emails = text.split('\n').filter(line => line.trim())
      return emails.length >= 3
    }, 'You need at least 3 participants for Secret Santa'),
  sendEmails: z.boolean(),
  exclusions: z.array(z.object({
    id: z.string(),
    from: z.string().email(),
    to: z.string().email(),
  })).default([]),
  forcedPairings: z.array(z.object({
    id: z.string(),
    from: z.string().email(),
    to: z.string().email(),
  })).default([]),
  nameMappings: z.array(z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  })).default([]),
})

interface SecretSantaFormProps {
  onResults: (results: SecretSantaResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function SecretSantaForm({ onResults, isLoading, setIsLoading }: SecretSantaFormProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const { toast } = useToast()
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailsText: '',
      sendEmails: true,
      exclusions: [],
      forcedPairings: [],
      nameMappings: [],
    },
  })

  const emailsText = form.watch('emailsText')
  const emailCount = parseEmails(emailsText || '').length

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const request = buildSecretSantaRequest(data)
      const results = await secretSantaApi.generatePairs(request)
      
      onResults(results)
      
      toast({
        title: "Success! 🎁",
        description: `Generated ${results.pairs.length} Secret Santa pairs`,
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || 'Failed to generate Secret Santa pairs',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Main Form - 60% on desktop */}
      <div className="lg:col-span-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
                <CardDescription>
                  Enter participant email addresses, one per line
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Email Input */}
                <FormField
                  control={form.control}
                  name="emailsText"
                  render={({ field }) => (
                    <EnhancedEmailInput
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="john@example.com&#10;jane@example.com&#10;bob@example.com"
                    />
                  )}
                />

                <Separator />

                {/* Email Toggle */}
                <FormField
                  control={form.control}
                  name="sendEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Delivery
                        </FormLabel>
                        <FormDescription>
                          Automatically send assignment emails to participants
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <Card className="border-dashed border-2 hover:border-solid hover:bg-accent/5 transition-all duration-200">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-lg">Advanced Options</span>
                          {!showAdvanced && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Click to customize exclusions, pairings & names
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Quick preview badges when collapsed */}
                        {!showAdvanced && (
                          <div className="flex gap-1">
                            {(form.watch('exclusions')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch('exclusions')?.length} exclusion{(form.watch('exclusions')?.length || 0) !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {(form.watch('forcedPairings')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch('forcedPairings')?.length} forced
                              </Badge>
                            )}
                            {(form.watch('nameMappings')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch('nameMappings')?.length} names
                              </Badge>
                            )}
                          </div>
                        )}
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CardTitle>
                    {!showAdvanced && (
                      <CardDescription className="text-sm">
                        🚫 Prevent couples from getting each other • 💕 Force specific pairings • 🏷️ Use display names
                      </CardDescription>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <AdvancedOptions
                      form={form}
                      emailsText={emailsText}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={emailCount < 3 || isLoading}
                className="px-8 py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-5 w-5" />
                    Generate Secret Santa Pairs
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Live Preview Panel - 40% on desktop */}
      <div className="lg:col-span-2">
        <Card className="sticky top-8 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See your setup in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Participant Count */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {emailCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Participant{emailCount !== 1 ? 's' : ''} Added
              </div>
            </div>

            {emailCount === 0 ? (
              /* Empty State */
              <div className="text-center py-8">
                <div className="bg-muted/30 rounded-lg p-6 mb-4">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Add participants to see your Secret Santa setup preview
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready when you are!
                </p>
              </div>
            ) : (
              /* Preview Content */
              <div className="space-y-4">
                {/* Readiness Status */}
                <div className={`p-3 rounded-lg border-2 transition-colors ${
                  emailCount >= 3 
                    ? 'border-secondary bg-secondary/10' 
                    : 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                }`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {emailCount >= 3 ? (
                      <>
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        Ready to generate!
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        Need {3 - emailCount} more participant{3 - emailCount !== 1 ? 's' : ''}
                      </>
                    )}
                  </div>
                </div>

                {/* Options Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email delivery:</span>
                    <span className={form.watch('sendEmails') ? 'text-secondary' : 'text-muted-foreground'}>
                      {form.watch('sendEmails') ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exclusions:</span>
                    <span className="text-foreground">
                      {form.watch('exclusions')?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forced pairs:</span>
                    <span className="text-foreground">
                      {form.watch('forcedPairings')?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custom names:</span>
                    <span className="text-foreground">
                      {form.watch('nameMappings')?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Advanced Options Preview */}
                {showAdvanced && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Advanced settings active:</p>
                    <div className="flex flex-wrap gap-1">
                      {(form.watch('exclusions')?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">Exclusions</Badge>
                      )}
                      {(form.watch('forcedPairings')?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">Forced Pairs</Badge>
                      )}
                      {(form.watch('nameMappings')?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">Names</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}