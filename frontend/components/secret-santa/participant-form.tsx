'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Users, Mail, Settings, ChevronDown } from 'lucide-react'

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
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Main Form - 60% on desktop (Box 3 - Elevated form area) */}
      <div className="lg:col-span-3 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Form Card (Box 4 - Most elevated interactive card) */}
            <Card className="bg-card shadow-standard hover:shadow-prominent transition-all duration-300 border-0">
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2.5 bg-gradient-to-br from-blue-300/30 to-blue-500/20 rounded-xl shadow-subtle">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>
                  <span className="bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                    Participants
                  </span>
                </CardTitle>
                <CardDescription className="text-base text-neutral-700">
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

                <Separator className="bg-neutral-200" />

                {/* Email Toggle (Elevated toggle box) */}
                <FormField
                  control={form.control}
                  name="sendEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 shadow-subtle hover:shadow-standard p-4 lg:p-5 border-0 transition-all duration-300 group">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2.5 text-base font-medium cursor-pointer">
                          <div className="p-1.5 bg-gradient-to-br from-green-300/40 to-green-500/30 rounded-lg shadow-subtle group-hover:shadow-standard transition-all duration-300">
                            <Mail className="h-4 w-4 text-green-700" />
                          </div>
                          <span className="text-neutral-900">Email Delivery</span>
                        </FormLabel>
                        <FormDescription className="text-sm text-neutral-700 ml-8">
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

            {/* Advanced Options (Box 4 - Collapsible elevated card) */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <Card className={`border-2 transition-all duration-300 ${
                showAdvanced
                  ? 'border-gold-500 bg-card shadow-standard'
                  : 'border-dashed border-neutral-300 bg-card/60 shadow-subtle hover:border-solid hover:border-gold-500/50 hover:shadow-standard'
              }`}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-gold-500/5 hover:to-transparent">
                    <CardTitle className="flex items-center justify-between text-lg lg:text-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-subtle ${
                          showAdvanced
                            ? 'bg-gradient-to-br from-gold-300 to-gold-500 shadow-button'
                            : 'bg-gradient-to-br from-gold-300/30 to-gold-500/20'
                        }`}>
                          <Settings className={`h-5 w-5 transition-colors ${
                            showAdvanced ? 'text-white' : 'text-gold-700'
                          }`} />
                        </div>
                        <div>
                          <span className="bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                            Advanced Options
                          </span>
                          {!showAdvanced && (
                            <div className="text-xs text-neutral-700 font-normal mt-1">
                              Click to customize exclusions, pairings & names
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Quick preview badges when collapsed */}
                        {!showAdvanced && (
                          <div className="flex gap-1.5 flex-wrap">
                            {(form.watch('exclusions')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs shadow-subtle">
                                {form.watch('exclusions')?.length} exclusion{(form.watch('exclusions')?.length || 0) !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {(form.watch('forcedPairings')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs shadow-subtle">
                                {form.watch('forcedPairings')?.length} forced
                              </Badge>
                            )}
                            {(form.watch('nameMappings')?.length || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs shadow-subtle">
                                {form.watch('nameMappings')?.length} names
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                          <ChevronDown className="h-5 w-5 text-neutral-700" />
                        </div>
                      </div>
                    </CardTitle>
                    {!showAdvanced && (
                      <CardDescription className="text-sm text-neutral-700 leading-relaxed">
                        🚫 Prevent couples from getting each other • 💕 Force specific pairings • 🏷️ Use display names
                      </CardDescription>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300">
                  <CardContent className="pt-0">
                    <div className="rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/30 p-4 lg:p-6 shadow-inset">
                      <AdvancedOptions
                        form={form}
                        emailsText={emailsText}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Generate Button (Box 5 - Most elevated CTA) */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={emailCount < 3 || isLoading}
                className="relative px-8 lg:px-12 py-6 lg:py-7 text-base lg:text-lg font-semibold bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-button hover:shadow-button-hover active:shadow-button-active disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {isLoading ? (
                  <>
                    <div className="mr-2.5 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="relative z-10">Generating...</span>
                  </>
                ) : (
                  <>
                    <Gift className="mr-2.5 h-5 w-5 lg:h-6 lg:w-6 drop-shadow-lg" />
                    <span className="relative z-10 drop-shadow-sm">Generate Secret Santa Pairs</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Live Preview Panel - 40% on desktop (Box 3 - Floating elevated panel) */}
      <div className="lg:col-span-2">
        <div className="sticky top-8">
          <Card className="bg-card shadow-prominent hover:shadow-elevated transition-all duration-500 border-0 overflow-hidden">
            {/* Gradient accent at top */}
            <div className="h-1.5 bg-gradient-to-r from-red-500 via-gold-500 to-green-500"></div>

            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 bg-gradient-to-br from-red-300/30 to-red-500/20 rounded-xl shadow-subtle">
                  <Gift className="h-5 w-5 text-red-700" />
                </div>
                <span className="bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                  Live Preview
                </span>
              </CardTitle>
              <CardDescription className="text-base text-neutral-700">
                See your setup in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Participant Count (Elevated number display) */}
              <div className="text-center py-4 px-6 rounded-xl bg-gradient-to-br from-red-100/50 to-red-300/20 shadow-inset">
                <div className="text-5xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                  {emailCount}
                </div>
                <div className="text-sm font-medium text-neutral-700">
                  Participant{emailCount !== 1 ? 's' : ''} Added
                </div>
              </div>

              {emailCount === 0 ? (
                /* Empty State (Subtle sunken box) */
                <div className="text-center py-8 px-4">
                  <div className="bg-gradient-to-br from-neutral-100 to-neutral-200/50 rounded-xl p-8 mb-4 shadow-inset">
                    <Gift className="h-14 w-14 mx-auto text-neutral-400 mb-4 drop-shadow-sm" />
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      Add participants to see your Secret Santa setup preview
                    </p>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium">
                    Ready when you are! ✨
                  </p>
                </div>
              ) : (
                /* Preview Content */
                <div className="space-y-4">
                  {/* Readiness Status (Elevated status badge) */}
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 shadow-standard ${
                    emailCount >= 3
                      ? 'border-green-500 bg-gradient-to-br from-green-100/60 to-green-300/30'
                      : 'border-gold-500 bg-gradient-to-br from-gold-100/60 to-gold-300/30'
                  }`}>
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      {emailCount >= 3 ? (
                        <>
                          <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-subtle animate-pulse"></div>
                          <span className="text-green-800">Ready to generate!</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full shadow-subtle animate-pulse"></div>
                          <span className="text-gold-800">Need {3 - emailCount} more participant{3 - emailCount !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Options Summary (Elevated info boxes) */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100/50 shadow-subtle">
                      <span className="text-neutral-700 font-medium">Email delivery:</span>
                      <span className={`font-semibold ${form.watch('sendEmails') ? 'text-green-700' : 'text-neutral-600'}`}>
                        {form.watch('sendEmails') ? 'Enabled ✓' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100/50 shadow-subtle">
                      <span className="text-neutral-700 font-medium">Exclusions:</span>
                      <Badge variant="secondary" className="shadow-subtle">
                        {form.watch('exclusions')?.length || 0}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100/50 shadow-subtle">
                      <span className="text-neutral-700 font-medium">Forced pairs:</span>
                      <Badge variant="secondary" className="shadow-subtle">
                        {form.watch('forcedPairings')?.length || 0}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100/50 shadow-subtle">
                      <span className="text-neutral-700 font-medium">Custom names:</span>
                      <Badge variant="secondary" className="shadow-subtle">
                        {form.watch('nameMappings')?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  {/* Advanced Options Preview */}
                  {showAdvanced && (
                    <div className="pt-3 border-t-2 border-neutral-200">
                      <p className="text-xs text-neutral-700 font-semibold mb-2.5">Advanced settings active:</p>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch('exclusions')?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs shadow-subtle bg-card">Exclusions</Badge>
                        )}
                        {(form.watch('forcedPairings')?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs shadow-subtle bg-card">Forced Pairs</Badge>
                        )}
                        {(form.watch('nameMappings')?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs shadow-subtle bg-card">Names</Badge>
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
    </div>
  )
}