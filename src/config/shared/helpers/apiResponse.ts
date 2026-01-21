import { Response } from 'express';
import httpStatus from 'http-status';

export const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = httpStatus.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res: Response, message: string, statusCode: number = httpStatus.BAD_REQUEST) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};