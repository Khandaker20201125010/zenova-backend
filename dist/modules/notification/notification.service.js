"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
const client_1 = require("@prisma/client"); // Import the enum from Prisma
class NotificationService {
    async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [notifications, total, unreadCount] = await Promise.all([
                prisma_1.prisma.notification.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.notification.count({ where: { userId } }),
                prisma_1.prisma.notification.count({ where: { userId, isRead: false } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Notifications retrieved successfully",
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
        }
        catch (error) {
            logger_1.default.error("Get user notifications error:", error);
            throw error;
        }
    }
    async markAsRead(userId, notificationId) {
        try {
            const notification = await prisma_1.prisma.notification.findUnique({
                where: { id: notificationId, userId },
            });
            if (!notification) {
                return {
                    success: false,
                    message: "Notification not found",
                };
            }
            const updatedNotification = await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            return {
                success: true,
                message: "Notification marked as read",
                data: updatedNotification,
            };
        }
        catch (error) {
            logger_1.default.error("Mark notification as read error:", error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            await prisma_1.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
            return {
                success: true,
                message: "All notifications marked as read",
            };
        }
        catch (error) {
            logger_1.default.error("Mark all notifications as read error:", error);
            throw error;
        }
    }
    async deleteNotification(userId, notificationId) {
        try {
            const notification = await prisma_1.prisma.notification.findUnique({
                where: { id: notificationId, userId },
            });
            if (!notification) {
                return {
                    success: false,
                    message: "Notification not found",
                };
            }
            await prisma_1.prisma.notification.delete({
                where: { id: notificationId },
            });
            return {
                success: true,
                message: "Notification deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete notification error:", error);
            throw error;
        }
    }
    async deleteAllNotifications(userId) {
        try {
            await prisma_1.prisma.notification.deleteMany({
                where: { userId },
            });
            return {
                success: true,
                message: "All notifications deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete all notifications error:", error);
            throw error;
        }
    }
    async createNotification(userId, title, message, type = client_1.NotificationType.INFO, // Use Prisma enum type
    data) {
        try {
            const notification = await prisma_1.prisma.notification.create({
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
                message: "Notification created successfully",
                data: notification,
            };
        }
        catch (error) {
            logger_1.default.error("Create notification error:", error);
            throw error;
        }
    }
    async getNotificationStats(userId) {
        try {
            const [total, unread, read, info, success, warning, error, today, thisWeek,] = await Promise.all([
                prisma_1.prisma.notification.count({ where: { userId } }),
                prisma_1.prisma.notification.count({ where: { userId, isRead: false } }),
                prisma_1.prisma.notification.count({ where: { userId, isRead: true } }),
                prisma_1.prisma.notification.count({ where: { userId, type: "INFO" } }),
                prisma_1.prisma.notification.count({ where: { userId, type: "SUCCESS" } }),
                prisma_1.prisma.notification.count({ where: { userId, type: "WARNING" } }),
                prisma_1.prisma.notification.count({ where: { userId, type: "ERROR" } }),
                prisma_1.prisma.notification.count({
                    where: {
                        userId,
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                prisma_1.prisma.notification.count({
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
                message: "Notification stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            logger_1.default.error("Get notification stats error:", error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map