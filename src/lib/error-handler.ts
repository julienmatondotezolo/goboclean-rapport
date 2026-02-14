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
 * Handle authentication errors
 */
export function handleAuthError(error: any) {
  return handleError(error, {
    title: 'Authentication Error',
  });
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
