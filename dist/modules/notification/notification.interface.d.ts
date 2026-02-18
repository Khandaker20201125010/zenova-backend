export interface CreateNotificationInput {
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    data?: any;
}
export interface NotificationQueryParams {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=notification.interface.d.ts.map