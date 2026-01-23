import { ZodError } from 'zod';
import { ApiResponseHelper } from './response.helper';
import { Response } from 'express';

export class ValidationHelper {
  static validate<T>(schema: any, data: any): { success: boolean; data?: T; errors?: any[] } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return { success: false, errors };
      }
      return { success: false, errors: [{ message: 'Validation failed' }] };
    }
  }

  static handleValidationError(res: Response, validationResult: { success: boolean; errors?: any[] }): boolean {
    if (!validationResult.success) {
      ApiResponseHelper.validationError(res, validationResult.errors || []);
      return false;
    }
    return true;
  }
}