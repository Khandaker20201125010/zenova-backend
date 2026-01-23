import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { ApiResponse } from '../types';
import logger from '../helpers/logger';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response<ApiResponse>,
 
) => {
  logger.error(`Error: ${error.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: error.stack,
  });

  // Zod validation error
  if (error instanceof ZodError) {
    const errorDetails = (error as any).errors || error.issues || [];
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      error: errorDetails.map((e: any) => ({
        field: e.path?.join('.') || e.field,
        message: e.message,
      })),
    });
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `Duplicate value for ${prismaError.meta?.target?.join(', ')}`,
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // Default error
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>,
  
) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};