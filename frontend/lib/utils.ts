import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import validator from "validator"

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
