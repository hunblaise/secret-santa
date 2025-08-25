'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Users, Mail, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from "sonner"

// TODO: The following imports will be available in later steps.
// import { secretSantaApi } from '@/lib/api'
// import { buildSecretSantaRequest } from '@/lib/utils'
import { SecretSantaResponse, FormData } from '@/lib/types'


import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
// TODO: The following import will be available in a later step.
// import { AdvancedOptions } from './advanced-options'

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
  const sendEmails = form.watch('sendEmails')
  const emailCount = emailsText?.split('\n').filter(line => line.trim()).length || 0

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // TODO: The following lines depend on files from Step 5 and are currently commented out.
      // const request = buildSecretSantaRequest(data)
      // const results = await secretSantaApi.generatePairs(request)
      // onResults(results)

      // Mocked success toast for now
      toast.success("Success! 🎁", {
        description: "Generated mock pairs. API call is not implemented yet.",
      })
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || 'Failed to generate Secret Santa pairs',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            {/* Email Input */}
            <FormField
              control={form.control}
              name="emailsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Addresses</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="john@example.com\njane@example.com\nbob@example.com"
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormDescription>
                      Enter one email address per line
                    </FormDescription>
                    <Badge variant={emailCount >= 3 ? "default" : "secondary"}>
                      {emailCount} participant{emailCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <FormMessage />
                </FormItem>
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
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Advanced Options
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
                <CardDescription>
                  Set exclusions, forced pairings, and name mappings
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* TODO: The AdvancedOptions component will be created in a later step. */}
                {/* <AdvancedOptions
                  form={form}
                  emailsText={emailsText}
                /> */}
                <p className="text-muted-foreground">Advanced options will be available here.</p>
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
  )
}
