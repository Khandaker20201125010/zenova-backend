export interface DashboardQueryParams {
    timeRange?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
}
export interface AnalyticsQueryParams {
    timeRange?: 'day' | 'week' | 'month' | 'year';
    metric?: 'revenue' | 'orders' | 'users' | 'products';
    groupBy?: 'day' | 'week' | 'month';
}
//# sourceMappingURL=dashboard.interface.d.ts.map