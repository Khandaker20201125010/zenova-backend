import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

import { AuthRequest } from '../types';
import { prisma } from '../helpers/prisma';
import { config } from '../../config';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => { // Add return type
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
      });
      return; // Explicit return
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not found or inactive',
      });
      return; // Explicit return
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
    return; // Explicit return
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => { // Add return type
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
      });
      return; // Explicit return
    }

    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return; // Explicit return
    }

    next();
  };
};

export const refreshTokenMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => { // Add return type
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Refresh token required',
      });
      return; // Explicit return
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return; // Explicit return
    }

    req.user = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    };

    next();
  } catch (error: any) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid refresh token',
    });
    return; // Explicit return
  }
};