import logger from "../../helpers/logger";
import { prisma } from "../../helpers/prisma";
import { ApiResponse } from "../../types";
import { NotificationType } from "@prisma/client"; // Import the enum from Prisma

export class NotificationService {
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse> {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications,
          unreadCount,
          meta: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error: any) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<ApiResponse> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found',
        };
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return {
        success: true,
        message: 'Notification marked as read',
        data: updatedNotification,
      };
    } catch (error: any) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<ApiResponse> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error: any) {
      logger.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<ApiResponse> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found',
        };
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error: any) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  async deleteAllNotifications(userId: string): Promise<ApiResponse> {
    try {
      await prisma.notification.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        message: 'All notifications deleted successfully',
      };
    } catch (error: any) {
      logger.error('Delete all notifications error:', error);
      throw error;
    }
  }

  async createNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: NotificationType = NotificationType.INFO, // Use Prisma enum type
    data?: any
  ): Promise<ApiResponse> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type, // Now using correct Prisma enum type
          data,
        },
      });

      return {
        success: true,
        message: 'Notification created successfully',
        data: notification,
      };
    } catch (error: any) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async getNotificationStats(userId: string): Promise<ApiResponse> {
    try {
      const [
        total,
        unread,
        read,
        info,
        success,
        warning,
        error,
        today,
        thisWeek,
      ] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        prisma.notification.count({ where: { userId, isRead: true } }),
        prisma.notification.count({ where: { userId, type: 'INFO' } }),
        prisma.notification.count({ where: { userId, type: 'SUCCESS' } }),
        prisma.notification.count({ where: { userId, type: 'WARNING' } }),
        prisma.notification.count({ where: { userId, type: 'ERROR' } }),
        prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
      ]);

      const stats = {
        total,
        unread,
        read,
        byType: { info, success, warning, error },
        today,
        thisWeek,
      };

      return {
        success: true,
        message: 'Notification stats retrieved successfully',
        data: stats,
      };
    } catch (error: any) {
      logger.error('Get notification stats error:', error);
      throw error;
    }
  }
}