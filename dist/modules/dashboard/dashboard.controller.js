"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const http_status_codes_1 = require("http-status-codes");
const dashboard_service_1 = require("./dashboard.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    async getAdminDashboard(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await dashboardService.getAdminDashboard();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get admin dashboard", error.message));
        }
    }
    async getUserDashboard(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await dashboardService.getUserDashboard(req.user.id);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user dashboard", error.message));
        }
    }
    async getManagerDashboard(req, res) {
        try {
            if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await dashboardService.getManagerDashboard();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get manager dashboard", error.message));
        }
    }
    async getAnalytics(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { timeRange = "month" } = req.query;
            const result = await dashboardService.getAnalytics(timeRange);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get analytics", error.message));
        }
    }
    async getSystemStatus(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await dashboardService.getSystemStatus();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get system status", error.message));
        }
    }
    async getRevenueAnalytics(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { timeRange = "month" } = req.query;
            const result = await dashboardService.getAnalytics(timeRange);
            if (result.success && result.data) {
                const analytics = result.data;
                const revenueData = analytics.charts?.revenueTrend || [];
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("Revenue analytics retrieved", {
                    revenueData,
                    totalRevenue: analytics.summary?.revenue || 0,
                    growthRate: this.calculateGrowthRate(revenueData),
                }));
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("Revenue analytics retrieved", {
                    revenueData: [],
                    totalRevenue: 0,
                    growthRate: 0,
                }));
            }
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get revenue analytics", error.message));
        }
    }
    async getUserAnalytics(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { timeRange = "month" } = req.query;
            const result = await dashboardService.getAnalytics(timeRange);
            if (result.success && result.data) {
                const analytics = result.data;
                const userGrowth = analytics.charts?.userGrowth || [];
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("User analytics retrieved", {
                    userGrowth,
                    totalUsers: analytics.summary?.newUsers || 0,
                    growthRate: this.calculateGrowthRate(userGrowth),
                    retentionRate: analytics.metrics?.userRetentionRate || 0,
                }));
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("User analytics retrieved", {
                    userGrowth: [],
                    totalUsers: 0,
                    growthRate: 0,
                    retentionRate: 0,
                }));
            }
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user analytics", error.message));
        }
    }
    async getSalesAnalytics(req, res) {
        try {
            if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { timeRange = "month" } = req.query;
            const result = await dashboardService.getAnalytics(timeRange);
            if (result.success && result.data) {
                const analytics = result.data;
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("Sales analytics retrieved", {
                    topProducts: analytics.topProducts || [],
                    categorySales: analytics.charts?.categorySales || [],
                    totalOrders: analytics.summary?.newOrders || 0,
                    averageOrderValue: analytics.metrics?.averageOrderValue || 0,
                    conversionRate: analytics.metrics?.conversionRate || 0,
                }));
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.OK).json((0, apiResponse_1.successResponse)("Sales analytics retrieved", {
                    topProducts: [],
                    categorySales: [],
                    totalOrders: 0,
                    averageOrderValue: 0,
                    conversionRate: 0,
                }));
            }
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get sales analytics", error.message));
        }
    }
    calculateGrowthRate(data) {
        if (data.length < 2)
            return 0;
        const firstValue = data[0]?.value || data[0]?.users || data[0]?.revenue || 0;
        const lastValue = data[data.length - 1]?.value ||
            data[data.length - 1]?.users ||
            data[data.length - 1]?.revenue ||
            0;
        if (firstValue === 0)
            return lastValue > 0 ? 100 : 0;
        return ((lastValue - firstValue) / firstValue) * 100;
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map