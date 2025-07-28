# Next.js + ShadCN/UI MVP Frontend Plan

## Overview
Create a professional Next.js frontend application with ShadCN/UI components that directly calls the existing `POST /generatePairs` endpoint. This approach combines Next.js benefits with a high-quality, accessible component library for rapid development.

## Why Next.js + ShadCN/UI?

### Key Advantages
- ✅ **Beautiful UI out of the box**: Professional, accessible components
- ✅ **Faster development**: Pre-built components reduce custom CSS
- ✅ **Consistent design**: Unified design system
- ✅ **Accessibility**: WCAG compliant components
- ✅ **Customizable**: Full control over styling and behavior
- ✅ **TypeScript native**: Excellent TypeScript support
- ✅ **Radix UI foundation**: Rock-solid primitives

### Time Comparison
| Task | Custom Components | ShadCN/UI | Difference |
|------|-------------------|------------|------------|
| Setup | 20 min | 25 min | +5 min (ShadCN setup) |
| Component Development | 45 min | 25 min | -20 min (pre-built) |
| Styling & Polish | 20 min | 10 min | -10 min (styled) |
| **Total** | **85 min** | **60 min** | **-25 min faster** |

## Backend API (Unchanged)

### Existing Endpoint
- **URL**: `POST /generatePairs`
- **Controller**: `SecretSantaController.java`
- **Service**: Full orchestration with `SecretSantaOrchestrationService`

### Request/Response Formats
*(Same as previous plans - unchanged backend)*

## Implementation Plan

### Step 1: Project Setup with ShadCN/UI (25 minutes)

#### 1.1 Create Next.js App
```bash
cd /mnt/c/dev/projects/secret-santa
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
```

#### 1.2 Initialize ShadCN/UI
```bash
# Initialize ShadCN/UI
npx shadcn-ui@latest init

# Configuration options:
# ✅ TypeScript: Yes
# ✅ Style: Default
# ✅ Base color: Slate
# ✅ Global CSS file: app/globals.css
# ✅ CSS variables: Yes
# ✅ Tailwind config: tailwind.config.js
# ✅ Components: @/components
# ✅ Utils: @/lib/utils
```

#### 1.3 Install Core ShadCN Components
```bash
# Essential components for our MVP
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
```

#### 1.4 Install Additional Dependencies
```bash
# Core functionality
npm install axios react-hook-form @hookform/resolvers zod

# Icons and utilities
npm install lucide-react

# Form integration
npm install @hookform/resolvers
```

#### 1.5 Enhanced Project Structure
```
frontend/
├── app/
│   ├── globals.css          # Global styles with ShadCN variables
│   ├── layout.tsx           # Root layout with Toaster
│   ├── page.tsx             # Main Secret Santa generator
│   ├── loading.tsx          # Global loading component
│   └── error.tsx            # Global error boundary
├── components/
│   ├── ui/                  # ShadCN/UI components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── ... (other ShadCN components)
│   ├── secret-santa/        # Feature-specific components
│   │   ├── participant-form.tsx
│   │   ├── advanced-options.tsx
│   │   ├── results-display.tsx
│   │   └── email-status.tsx
│   └── layout/              # Layout components
│       ├── header.tsx
│       └── footer.tsx
├── lib/
│   ├── utils.ts            # ShadCN utilities + custom utils
│   ├── api.ts              # API service
│   ├── types.ts            # TypeScript types
│   └── validations.ts      # Zod schemas
├── public/
└── components.json         # ShadCN configuration
```

### Step 2: Core Configuration (10 minutes)

#### 2.1 Root Layout with ShadCN Toaster (`app/layout.tsx`)
```tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Secret Santa Generator - Create Perfect Gift Exchanges',
  description: 'Generate Secret Santa pairs with exclusions, forced pairings, and automatic email delivery.',
  keywords: 'secret santa, gift exchange, random pairs, christmas, holiday',
  openGraph: {
    title: 'Secret Santa Generator',
    description: 'Generate perfect Secret Santa pairs with advanced options',
    images: ['/santa-share.png'],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
```

#### 2.2 Enhanced TypeScript Types (`lib/types.ts`)
```tsx
export interface SecretSantaRequest {
  emails: string[];
  exclusions?: Record<string, string[]>;
  mappings?: Record<string, string>;
  cheats?: Record<string, string>;
  emailSendingEnabled: boolean;
}

export interface Pair {
  from: string;
  to: string;
}

export type EmailStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'DISABLED' | 'PENDING';
export type EmailResult = 'DELIVERED' | 'FAILED' | 'PENDING' | 'SKIPPED';

export interface SecretSantaResponse {
  pairs: Pair[];
  emailStatus: EmailStatus;
  emailResults: Record<string, EmailResult>;
  errors: string[];
  timestamp: string;
}

export interface FormData {
  emailsText: string;
  sendEmails: boolean;
  exclusions: ExclusionRule[];
  forcedPairings: ForcedPairing[];
  nameMappings: NameMapping[];
}

export interface ExclusionRule {
  id: string;
  from: string;
  to: string;
}

export interface ForcedPairing {
  id: string;
  from: string;
  to: string;
}

export interface NameMapping {
  id: string;
  email: string;
  name: string;
}
```

### Step 3: Main Application Components (20 minutes)

#### 3.1 Main Page (`app/page.tsx`)
```tsx
'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { SecretSantaForm } from '@/components/secret-santa/participant-form'
import { ResultsDisplay } from '@/components/secret-santa/results-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SecretSantaResponse } from '@/lib/types'

export default function Home() {
  const [results, setResults] = useState<SecretSantaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = () => {
    setResults(null)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
            <Gift className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Secret Santa Generator
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Create magical gift exchanges with advanced pairing options
        </p>
      </div>

      {/* Main Content */}
      {!results ? (
        <SecretSantaForm 
          onResults={setResults} 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <ResultsDisplay 
          results={results} 
          onReset={handleReset}
        />
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>Built with ❤️ for making gift exchanges magical</p>
      </div>
    </main>
  )
}
```

#### 3.2 Secret Santa Form (`components/secret-santa/participant-form.tsx`)
```tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Users, Mail, Settings, ChevronDown, ChevronUp } from 'lucide-react'

import { secretSantaApi } from '@/lib/api'
import { SecretSantaResponse, FormData } from '@/lib/types'
import { buildSecretSantaRequest } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AdvancedOptions } from './advanced-options'

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
  const sendEmails = form.watch('sendEmails')
  const emailCount = emailsText?.split('\n').filter(line => line.trim()).length || 0

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to generate Secret Santa pairs',
        variant: "destructive",
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
                      placeholder="john@example.com&#10;jane@example.com&#10;bob@example.com"
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
  )
}
```

#### 3.3 Results Display (`components/secret-santa/results-display.tsx`)
```tsx
'use client'

import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Gift, RotateCcw, Download, Copy, ArrowRight } from 'lucide-react'

import { SecretSantaResponse } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ResultsDisplayProps {
  results: SecretSantaResponse
  onReset: () => void
}

export function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  const { toast } = useToast()

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
    
    if (success) return <CheckCircle className="h-8 w-8 text-green-600" />
    if (hasErrors) return <XCircle className="h-8 w-8 text-red-600" />
    return <AlertCircle className="h-8 w-8 text-yellow-600" />
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
    } catch (error) {
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
    <div className="space-y-6">
      {/* Success Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            Secret Santa Pairs Generated!
          </CardTitle>
          <CardDescription>
            Successfully created {results.pairs.length} assignments
          </CardDescription>
          
          {/* Summary */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              Generated at {new Date(results.timestamp).toLocaleString()}
            </p>
            {results.emailStatus !== 'DISABLED' && (
              <div className="flex items-center justify-center gap-2 mt-2">
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
  )
}
```

### Step 4: Advanced Options Component (15 minutes)

#### 4.1 Advanced Options (`components/secret-santa/advanced-options.tsx`)
```tsx
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
import { Separator } from '@/components/ui/separator'
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
```

### Step 5: Utilities and API (10 minutes)

#### 5.1 Enhanced Utils (`lib/utils.ts`)
```tsx
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FormData, SecretSantaRequest } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseEmails(emailsText: string): string[] {
  return emailsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.includes('@'))
}

export function buildSecretSantaRequest(formData: FormData): SecretSantaRequest {
  const emails = parseEmails(formData.emailsText)
  
  // Build exclusions map
  const exclusions: Record<string, string[]> = {}
  formData.exclusions.forEach(exclusion => {
    if (exclusion.from && exclusion.to) {
      if (!exclusions[exclusion.from]) {
        exclusions[exclusion.from] = []
      }
      exclusions[exclusion.from].push(exclusion.to)
    }
  })
  
  // Build mappings map
  const mappings: Record<string, string> = {}
  formData.nameMappings.forEach(mapping => {
    if (mapping.email && mapping.name) {
      mappings[mapping.email] = mapping.name
    }
  })
  
  // Build cheats map
  const cheats: Record<string, string> = {}
  formData.forcedPairings.forEach(pairing => {
    if (pairing.from && pairing.to) {
      cheats[pairing.from] = pairing.to
    }
  })
  
  return {
    emails,
    exclusions: Object.keys(exclusions).length > 0 ? exclusions : undefined,
    mappings: Object.keys(mappings).length > 0 ? mappings : undefined,
    cheats: Object.keys(cheats).length > 0 ? cheats : undefined,
    emailSendingEnabled: formData.sendEmails,
  }
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

#### 5.2 API Service (same as before, no changes needed)

## Benefits of ShadCN/UI Approach

### Development Speed
- ✅ **25 minutes faster** than custom components
- ✅ **Pre-styled components** reduce CSS work
- ✅ **Consistent design** without design decisions
- ✅ **Accessibility built-in** (WCAG compliant)

### Code Quality
- ✅ **TypeScript native** with excellent type safety
- ✅ **Radix UI primitives** for solid foundations
- ✅ **Customizable** via CSS variables
- ✅ **Tree-shakeable** for optimal bundle size

### User Experience
- ✅ **Professional appearance** immediately
- ✅ **Smooth animations** and interactions
- ✅ **Dark mode support** built-in
- ✅ **Mobile responsive** by default

### Maintainability
- ✅ **Copy and paste friendly** - own your components
- ✅ **No runtime dependencies** - just build-time
- ✅ **Easy upgrades** via CLI
- ✅ **Extensive documentation** and examples

## Final Time Estimate

| Phase | Task | Time |
|-------|------|------|
| **Setup** | Next.js + ShadCN initialization | 25 min |
| **Core** | Main form with ShadCN components | 15 min |
| **Core** | Results display with ShadCN | 10 min |
| **Features** | Advanced options with tabs/forms | 15 min |
| **Polish** | Final styling and responsive design | 5 min |
| **Deploy** | Vercel deployment | 5 min |
| **Total** | | **75 minutes** |

## MCP Server Integration

With the ShadCN MCP server available, you can:

```bash
# Query available components
"What ShadCN components are available for forms?"

# Get component code
"Show me the ShadCN card component code"

# Get usage examples
"How do I use ShadCN form components with react-hook-form?"
```

This makes development even faster by having instant access to component documentation and examples.

## Conclusion

The **Next.js + ShadCN/UI approach** delivers:
- ✅ **Professional UI** in record time (75 minutes)
- ✅ **Accessible components** that work for everyone
- ✅ **Future-proof architecture** for scaling
- ✅ **Excellent developer experience** with TypeScript
- ✅ **Production-ready** deployment on Vercel

This approach gives you the best of both worlds: rapid development with professional results, while maintaining full control over your codebase.