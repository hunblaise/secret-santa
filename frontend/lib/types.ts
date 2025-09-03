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
  exclusions?: ExclusionRule[];
  forcedPairings?: ForcedPairing[];
  nameMappings?: NameMapping[];
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

// Error response interfaces for robust error handling
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  timestamp?: string;
  path?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}