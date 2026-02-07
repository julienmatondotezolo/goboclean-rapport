/**
 * Global error handler for consistent error toasts across the app
 */

import { toast } from '@/components/ui/use-toast';

export interface ErrorHandlerOptions {
  title?: string;
  description?: string;
  showToast?: boolean;
}

/**
 * Handle errors consistently across the app
 * Always shows a red toast with white text
 */
export function handleError(error: any, options: ErrorHandlerOptions = {}) {
  const {
    title = 'Error',
    description,
    showToast = true,
  } = options;

  // Log error to console for debugging
  console.error('Error:', error);

  // Extract error message
  let errorMessage = description || 'An unexpected error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.error?.message) {
    errorMessage = error.error.message;
  }

  // Show toast if enabled
  if (showToast) {
    toast({
      title,
      description: errorMessage,
      variant: 'destructive', // Always red with white text
    });
  }

  return errorMessage;
}

/**
 * Handle Supabase errors specifically
 */
export function handleSupabaseError(error: any, context?: string) {
  const title = context ? `${context} Error` : 'Database Error';
  
  // Common Supabase error messages
  const errorMessages: Record<string, string> = {
    'JWT expired': 'Your session has expired. Please login again.',
    'Invalid JWT': 'Your session is invalid. Please login again.',
    'permission denied': 'You don\'t have permission to access this resource.',
    'row-level security': 'Access denied. Please check your permissions.',
    'duplicate key': 'This record already exists.',
    'foreign key': 'Cannot delete this record as it\'s being used elsewhere.',
  };

  // Check if error message matches any known patterns
  let customMessage: string | undefined;
  if (error?.message) {
    for (const [pattern, message] of Object.entries(errorMessages)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        customMessage = message;
        break;
      }
    }
  }

  return handleError(error, {
    title,
    description: customMessage,
  });
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: any) {
  return handleSupabaseError(error, 'Authentication');
}

/**
 * Show success toast
 */
export function showSuccess(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'success', // Green with white text
  });
}
