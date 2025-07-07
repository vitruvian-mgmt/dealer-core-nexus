import { PostgrestError } from '@supabase/supabase-js';

export interface SecureError {
  message: string;
  code?: string;
  details?: string;
}

export class SecurityError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const handleSupabaseError = (error: PostgrestError | Error): SecureError => {
  // Log the full error for debugging (server-side only)
  console.error('Database Error:', error);
  
  // Return sanitized error messages to the client
  if ('code' in error) {
    switch (error.code) {
      case 'PGRST116': // Row level security
        return {
          message: 'Access denied. You do not have permission to perform this operation.',
          code: 'ACCESS_DENIED'
        };
      case '23505': // Unique violation
        return {
          message: 'A record with this information already exists.',
          code: 'DUPLICATE_RECORD'
        };
      case '23503': // Foreign key violation
        return {
          message: 'Referenced record does not exist or is not accessible.',
          code: 'INVALID_REFERENCE'
        };
      case '23514': // Check constraint
        return {
          message: 'The provided data does not meet system requirements.',
          code: 'INVALID_DATA'
        };
      case '42501': // Insufficient privilege
        return {
          message: 'Insufficient permissions to complete this operation.',
          code: 'INSUFFICIENT_PERMISSIONS'
        };
      default:
        return {
          message: 'An error occurred while processing your request.',
          code: 'UNKNOWN_ERROR'
        };
    }
  }
  
  // Handle custom security errors
  if (error instanceof SecurityError) {
    return {
      message: error.message,
      code: error.code
    };
  }
  
  // Generic error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  };
};

export const logSecurityEvent = (
  event: string, 
  userId?: string, 
  details?: Record<string, any>
) => {
  // In production, this should log to a secure logging service
  console.warn(`Security Event: ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  });
};

export const rateLimitKey = (action: string, userId?: string): string => {
  return `rate_limit:${action}:${userId || 'anonymous'}`;
};