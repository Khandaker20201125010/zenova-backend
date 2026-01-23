import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginationMeta } from '../types/common.types';

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = StatusCodes.OK,
    meta?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errors?: any[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, StatusCodes.CREATED);
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, StatusCodes.NOT_FOUND);
  }

  static badRequest(res: Response, message: string = 'Bad request', errors?: any[]): Response {
    return this.error(res, message, StatusCodes.BAD_REQUEST, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, StatusCodes.FORBIDDEN);
  }

  static validationError(res: Response, errors: any[]): Response {
    return this.error(res, 'Validation failed', StatusCodes.UNPROCESSABLE_ENTITY, errors);
  }
}