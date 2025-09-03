import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import validator from "validator"
import { FormData, SecretSantaRequest } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseEmails(emailsText: string): string[] {
  return emailsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && validateEmail(line))
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email)
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
