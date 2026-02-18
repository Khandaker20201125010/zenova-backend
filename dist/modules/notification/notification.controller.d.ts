import { Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class NotificationController {
    getUserNotifications(req: AuthRequest, res: Response): Promise<Response>;
    markAsRead(req: AuthRequest, res: Response): Promise<Response>;
    markAllAsRead(req: AuthRequest, res: Response): Promise<Response>;
    deleteNotification(req: AuthRequest, res: Response): Promise<Response>;
    deleteAllNotifications(req: AuthRequest, res: Response): Promise<Response>;
    createNotification(req: AuthRequest, res: Response): Promise<Response>;
    getNotificationStats(req: AuthRequest, res: Response): Promise<Response>;
    getUnreadCount(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=notification.controller.d.ts.map