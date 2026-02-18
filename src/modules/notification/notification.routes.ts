import { Router } from "express";
import { NotificationController } from "./notification.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import { createNotificationSchema } from "./notification.validation";

const router = Router();
const notificationController = new NotificationController();

// User routes
router.get("/",  notificationController.getUserNotifications);
router.get("/stats", authenticate, notificationController.getNotificationStats);
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount,
);
router.put("/:id/read", authenticate, notificationController.markAsRead);
router.put(
  "/mark-all-read",
  authenticate,
  notificationController.markAllAsRead,
);
router.delete("/:id", authenticate, notificationController.deleteNotification);
router.delete("/", authenticate, notificationController.deleteAllNotifications);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createNotificationSchema),
  notificationController.createNotification,
);

export default router;
