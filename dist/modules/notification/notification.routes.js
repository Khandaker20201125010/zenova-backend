"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const notification_validation_1 = require("./notification.validation");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// User routes
router.get("/", auth_middleware_1.authenticate, notificationController.getUserNotifications);
router.get("/stats", auth_middleware_1.authenticate, notificationController.getNotificationStats);
router.get("/unread-count", auth_middleware_1.authenticate, notificationController.getUnreadCount);
router.put("/:id/read", auth_middleware_1.authenticate, notificationController.markAsRead);
router.put("/mark-all-read", auth_middleware_1.authenticate, notificationController.markAllAsRead);
router.delete("/:id", auth_middleware_1.authenticate, notificationController.deleteNotification);
router.delete("/", auth_middleware_1.authenticate, notificationController.deleteAllNotifications);
// Admin routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(notification_validation_1.createNotificationSchema), notificationController.createNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map