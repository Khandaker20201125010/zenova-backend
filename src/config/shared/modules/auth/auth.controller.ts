import { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.validation';
import { registerService, loginService } from './auth.services';
import { errorResponse, successResponse } from '../../helpers/apiResponse';


export const registerController = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerService(validatedData);

    // Set token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    successResponse(res, result, 'Registration successful', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginService(validatedData);

    // Set token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    successResponse(res, result, 'Login successful');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie('token');
  successResponse(res, null, 'Logout successful');
};