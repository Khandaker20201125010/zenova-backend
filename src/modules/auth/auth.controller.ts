import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.services";
import {
  errorResponse,
  successResponse,
} from "../../shared/helpers/apiResponse";
import { AuthRequest } from "../../shared/types";
import { prisma } from "../../shared/helpers/prisma";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.register(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Registration failed", error.message));
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.login(req.body);

      if (!result.success) {
        return res.status(StatusCodes.UNAUTHORIZED).json(result);
      }

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Login failed", error.message));
    }
  }

  async socialLogin(req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.socialLogin(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Social login failed", error.message));
    }
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Refresh token is required"));
      }

      const result = await authService.refreshToken(refreshToken);

      if (!result.success) {
        return res.status(StatusCodes.UNAUTHORIZED).json(result);
      }

      // Set new refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Token refresh failed", error.message));
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken || !req.user) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Invalid request"));
      }

      const result = await authService.logout(refreshToken, req.user.id);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Logout failed", error.message));
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      const result = await authService.requestPasswordReset(email);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Password reset request failed", error.message));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Password reset failed", error.message));
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await authService.changePassword(req.user.id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Password change failed", error.message));
    }
  }

  async demoLogin(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await authService.demoLogin();

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Demo login failed", error.message));
    }
  }

  async me(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          phone: true,
          company: true,
          position: true,
          bio: true,
          emailVerified: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(errorResponse("User not found"));
      }

      return res
        .status(StatusCodes.OK)
        .json(successResponse("User retrieved successfully", user));
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get user", error.message));
    }
  }
}
