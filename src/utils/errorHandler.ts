import { TRPCClientError } from '@trpc/client';

interface ErrorContext {
  defaultMessage?: string;
  showToast?: boolean;
}

/**
 * Centralized error handler for tRPC and general errors
 * Extracts meaningful error messages and formats them for display
 */
export function handleApiError(error: unknown, context: ErrorContext = {}): {
  headerText: string;
  paragraphText: string;
} {
  const { defaultMessage = 'An unexpected error occurred', showToast = true } = context;

  // Handle tRPC errors
  if (error instanceof TRPCClientError) {
    const tRPCError = error as TRPCClientError<any>;
    
    // Extract the error shape from tRPC
    const errorData = tRPCError.data;
    
    // Handle different tRPC error codes
    switch (tRPCError.shape?.code) {
      case 'UNAUTHORIZED':
        return {
          headerText: 'Unauthorized',
          paragraphText: errorData?.message || 'You need to be logged in to perform this action',
        };
      case 'FORBIDDEN':
        return {
          headerText: 'Access Denied',
          paragraphText: errorData?.message || "You don't have permission to perform this action",
        };
      case 'NOT_FOUND':
        return {
          headerText: 'Not Found',
          paragraphText: errorData?.message || 'The requested resource was not found',
        };
      case 'BAD_REQUEST':
        return {
          headerText: 'Invalid Request',
          paragraphText: errorData?.message || 'Please check your input and try again',
        };
      case 'INTERNAL_SERVER_ERROR':
        return {
          headerText: 'Server Error',
          paragraphText: errorData?.message || 'Something went wrong on our end. Please try again later',
        };
      case 'TIMEOUT':
        return {
          headerText: 'Request Timeout',
          paragraphText: 'The request took too long. Please try again',
        };
      case 'CONFLICT':
        return {
          headerText: 'Conflict',
          paragraphText: errorData?.message || 'This action conflicts with existing data',
        };
      default:
        return {
          headerText: 'Error',
          paragraphText: errorData?.message || tRPCError.message || defaultMessage,
        };
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      headerText: 'Error',
      paragraphText: error.message || defaultMessage,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      headerText: 'Error',
      paragraphText: error,
    };
  }

  // Fallback for unknown error types
  return {
    headerText: 'Error',
    paragraphText: defaultMessage,
  };
}

/**
 * Hook-friendly error handler that can be used in onError callbacks
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  const { paragraphText } = handleApiError(error, { defaultMessage: fallback });
  return paragraphText;
}
