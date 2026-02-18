import { ApiResponse } from "../../shared/types";
export declare class DashboardService {
    getAdminDashboard(): Promise<ApiResponse>;
    getUserDashboard(userId: string): Promise<ApiResponse>;
    getManagerDashboard(): Promise<ApiResponse>;
    getAnalytics(timeRange?: "day" | "week" | "month" | "year"): Promise<ApiResponse>;
    private calculateInventoryValue;
    private calculateAverageProcessingTime;
    private calculateOrderFulfillmentRate;
    private getUserGrowthData;
    private getRevenueTrendData;
    private getCategorySalesData;
    private calculateUserRetentionRate;
    private calculateConversionRate;
    getSystemStatus(): Promise<ApiResponse>;
}
//# sourceMappingURL=dashboard.service.d.ts.map