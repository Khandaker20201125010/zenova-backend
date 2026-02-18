import { ApiResponse } from "../../shared/types";
import { NotificationType } from "@prisma/client";
export declare class NotificationService {
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<ApiResponse>;
    markAsRead(userId: string, notificationId: string): Promise<ApiResponse>;
    markAllAsRead(userId: string): Promise<ApiResponse>;
    deleteNotification(userId: string, notificationId: string): Promise<ApiResponse>;
    deleteAllNotifications(userId: string): Promise<ApiResponse>;
    createNotification(userId: string, title: string, message: string, type?: NotificationType, // Use Prisma enum type
    data?: any): Promise<ApiResponse>;
    getNotificationStats(userId: string): Promise<ApiResponse>;
}
//# sourceMappingURL=notification.service.d.ts.map