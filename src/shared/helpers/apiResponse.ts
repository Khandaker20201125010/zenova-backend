import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  message: string,
  data?: T,
  meta?: any
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
});

export const errorResponse = (
  message: string,
  error?: unknown
): ApiResponse => {
  // Convert error to proper type
  let errorValue: string | any[] | undefined;
  
  if (typeof error === 'string') {
    errorValue = error;
  } else if (Array.isArray(error)) {
    errorValue = error;
  } else if (error instanceof Error && error.message) {
    errorValue = error.message;
  } else if (error) {
    errorValue = String(error);
  }
  
  return {
    success: false,
    message,
    error: errorValue,
  };
};

export const errorMessageResponse = (message: string): ApiResponse => ({
  success: false,
  message,
});

export const validationErrorResponse = (errors: any[] | string): ApiResponse => {
  return {
    success: false,
    message: 'Validation failed',
    error: Array.isArray(errors) ? errors : [errors],
  };
};

// Helper to convert any error to string
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (Array.isArray(error)) return error.join(', ');
  return 'An unknown error occurred';
};