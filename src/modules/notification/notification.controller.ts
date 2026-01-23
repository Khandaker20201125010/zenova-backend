import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "./notification.service";
import { AuthRequest } from "../../shared/types";
import {
  errorResponse,
  successResponse,
} from "../../shared/helpers/apiResponse";
import { NotificationType } from "@prisma/client"; // Import Prisma enum

const notificationService = new NotificationService();

export class NotificationController {
  async getUserNotifications(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const { page = 1, limit = 20 } = req.query;
      const result = await notificationService.getUserNotifications(
        req.user.id,
        parseInt(page as string),
        parseInt(limit as string),
      );

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get notifications", error.message));
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await notificationService.markAsRead(req.user.id, id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to mark notification as read", error.message),
        );
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await notificationService.markAllAsRead(req.user.id);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse(
            "Failed to mark all notifications as read",
            error.message,
          ),
        );
    }
  }

  async deleteNotification(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await notificationService.deleteNotification(
        req.user.id,
        id,
      );

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to delete notification", error.message));
    }
  }

  async deleteAllNotifications(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await notificationService.deleteAllNotifications(
        req.user.id,
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to delete all notifications", error.message),
        );
    }
  }

  async createNotification(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { userId, ...data } = req.body;
      const result = await notificationService.createNotification(
        userId,
        data.title,
        data.message,
        data.type as NotificationType, // Cast to Prisma enum type
        data.data,
      );

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create notification", error.message));
    }
  }

  async getNotificationStats(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await notificationService.getNotificationStats(
        req.user.id,
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get notification stats", error.message));
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await notificationService.getUserNotifications(
        req.user.id,
        1,
        1,
      );

      if (result.success && result.data) {
        return res.status(StatusCodes.OK).json(
          successResponse("Unread count retrieved", {
            unreadCount: (result.data as any).unreadCount || 0,
          }),
        );
      } else {
        return res
          .status(StatusCodes.OK)
          .json(successResponse("Unread count retrieved", { unreadCount: 0 }));
      }
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get unread count", error.message));
    }
  }
}
