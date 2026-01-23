import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SettingsService } from "./settings.service";
import { AuthRequest } from "../../shared/types";
import { errorResponse } from "../../shared/helpers/apiResponse";

const settingsService = new SettingsService();

export class SettingsController {
  async getSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await settingsService.getSettings();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get settings", error.message));
    }
  }

  async getSetting(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for key
      const key = Array.isArray(req.params.key)
        ? req.params.key[0]
        : req.params.key;
      const result = await settingsService.getSetting(key);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get setting", error.message));
    }
  }

  async updateSetting(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { key, value, type } = req.body;
      const result = await settingsService.updateSetting(key, value, type);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update setting", error.message));
    }
  }

  async updateMultipleSettings(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await settingsService.updateMultipleSettings(req.body);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update settings", error.message));
    }
  }

  async getSystemSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await settingsService.getSystemSettings();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get system settings", error.message));
    }
  }

  async updateSystemSettings(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await settingsService.updateSystemSettings(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update system settings", error.message));
    }
  }

  async getPublicSettings(req: Request, res: Response): Promise<Response> {
    try {
      const result = await settingsService.getPublicSettings();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get public settings", error.message));
    }
  }

  async initializeSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const defaultSettings = {
        "site.name": "SaaS Platform",
        "site.description": "Professional SaaS/Business Platform",
        "site.logo": "/logo.png",
        "site.favicon": "/favicon.ico",
        "site.theme": "light",
        "site.language": "en",
        "site.timezone": "UTC",
        "site.currency": "USD",
        "email.enabled": true,
        "email.fromName": "SaaS Platform",
        "email.fromEmail": "noreply@saasplatform.com",
        "payment.stripeEnabled": false,
        "payment.currency": "usd",
        "storage.provider": "cloudinary",
        "features.enableBlog": true,
        "features.enableReviews": true,
        "features.enableNotifications": true,
        "features.enableTwoFactor": false,
        "security.requireEmailVerification": false,
        "security.requireStrongPasswords": true,
        "security.maxLoginAttempts": 5,
        "security.sessionTimeout": 24,
      };

      const result =
        await settingsService.updateMultipleSettings(defaultSettings);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to initialize settings", error.message));
    }
  }
}
