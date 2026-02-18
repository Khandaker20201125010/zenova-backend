"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const notification_service_1 = require("./notification.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const notificationService = new notification_service_1.NotificationService();
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const { page = 1, limit = 20 } = req.query;
            const result = await notificationService.getUserNotifications(req.user.id, parseInt(page), parseInt(limit));
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get notifications", error.message));
        }
    }
    async markAsRead(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await notificationService.markAsRead(req.user.id, id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to mark notification as read", error.message));
        }
    }
    async markAllAsRead(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await notificationService.markAllAsRead(req.user.id);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to mark all notifications as read", error.message));
        }
    }
    async deleteNotification(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await notificationService.deleteNotification(req.user.id, id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete notification", error.message));
        }
    }
    async deleteAllNotifications(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await notificationService.deleteAllNotifications(req.user.id);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete all notifications", error.message));
        }
    }
    async createNotification(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { userId, ...data } = req.body;
            const result = await notificationService.createNotification(userId, data.title, data.message, data.type, // Cast to Prisma enum type
            data.data);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create notification", error.message));
        }
    }
    async getNotificationStats(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await notificationService.getNotificationStats(req.user.id);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get notification stats", error.message));
        }
    }
    async getUnreadCount(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await notificationService.getUserNotifications(req.user.id, 1, 1);
            if (result.success && result.data) {
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("Unread count retrieved", {
                    unreadCount: result.data.unreadCount || 0,
                }));
            }
            else {
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json((0, apiResponse_1.successResponse)("Unread count retrieved", { unreadCount: 0 }));
            }
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get unread count", error.message));
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map