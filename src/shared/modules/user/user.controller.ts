import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import { UserQueryParams } from "./user.interface";

import {
  errorMessageResponse,
  errorResponse,
  getErrorMessage,
} from "../../helpers/apiResponse";
import { AuthRequest } from "../../types";

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const result = await userService.getProfile(req.user.id);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get profile", getErrorMessage(error)));
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const result = await userService.updateProfile(req.user.id, req.body);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to update profile", getErrorMessage(error)),
        );
    }
  }

  async updateEmail(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const result = await userService.updateEmail(req.user.id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update email", getErrorMessage(error)));
    }
  }

  async toggleTwoFactor(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const result = await userService.toggleTwoFactor(req.user.id, req.body);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            "Failed to toggle two-factor authentication",
            getErrorMessage(error),
          ),
        );
    }
  }

 async uploadAvatar(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorMessageResponse("Authentication required"));
    }

    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(errorMessageResponse("No file uploaded"));
    }

    // Debug: Log what's in req.file
    console.log('req.file:', req.file);
    console.log('req.file keys:', Object.keys(req.file));
    
    // Try different ways to get the URL
    const file = req.file as any;
    console.log('file.secure_url:', file.secure_url);
    console.log('file.url:', file.url);
    console.log('file.path:', file.path);
    console.log('file.location:', file.location);
    console.log('All properties:', file);

    // Try to get the URL from different possible properties
    const avatarUrl = file.secure_url || file.url || file.path || file.location;
    
    if (!avatarUrl) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        errorResponse('Failed to get image URL from upload')
      );
    }

    const result = await userService.uploadAvatar(req.user.id, avatarUrl);

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse("Failed to upload avatar", getErrorMessage(error)));
  }
}

  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorMessageResponse("Insufficient permissions"));
      }

      // Parse query parameters
      const queryParams: UserQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await userService.getUsers(queryParams);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get users", getErrorMessage(error)));
    }
  }

  async getUserById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Get the ID as string
      const userId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!req.user || (req.user.role !== "ADMIN" && req.user.id !== userId)) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorMessageResponse("Insufficient permissions"));
      }

      const result = await userService.getUserById(userId);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get user", getErrorMessage(error)));
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorMessageResponse("Insufficient permissions"));
      }

      const { status } = req.body;
      const userId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await userService.updateUserStatus(userId, status);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to update user status", getErrorMessage(error)),
        );
    }
  }

  async updateUserRole(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorMessageResponse("Insufficient permissions"));
      }

      const { role } = req.body;
      const userId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await userService.updateUserRole(userId, role);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to update user role", getErrorMessage(error)),
        );
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorMessageResponse("Insufficient permissions"));
      }

      // Get the ID as string
      const userId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      // Prevent deleting own account
      if (req.user.id === userId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorMessageResponse("Cannot delete your own account"));
      }

      const result = await userService.deleteUser(userId);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to delete user", getErrorMessage(error)));
    }
  }

  async getUserStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const result = await userService.getUserStats(req.user.id);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to get user stats", getErrorMessage(error)),
        );
    }
  }

  async getActivities(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorMessageResponse("Authentication required"));
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await userService.getActivities(req.user.id, page, limit);

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to get activities", getErrorMessage(error)),
        );
    }
  }
}
