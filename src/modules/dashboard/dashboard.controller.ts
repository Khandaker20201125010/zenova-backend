import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DashboardService } from "./dashboard.service";
import { AuthRequest } from "../../shared/types";
import {
  errorResponse,
  successResponse,
} from "../../shared/helpers/apiResponse";

const dashboardService = new DashboardService();

export class DashboardController {
  async getAdminDashboard(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await dashboardService.getAdminDashboard();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get admin dashboard", error.message));
    }
  }

  async getUserDashboard(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await dashboardService.getUserDashboard(req.user.id);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get user dashboard", error.message));
    }
  }

  async getManagerDashboard(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await dashboardService.getManagerDashboard();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get manager dashboard", error.message));
    }
  }

  async getAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { timeRange = "month" } = req.query;
      const result = await dashboardService.getAnalytics(timeRange as any);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get analytics", error.message));
    }
  }

  async getSystemStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await dashboardService.getSystemStatus();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get system status", error.message));
    }
  }

  async getRevenueAnalytics(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { timeRange = "month" } = req.query;
      const result = await dashboardService.getAnalytics(timeRange as any);

      if (result.success && result.data) {
        const analytics = result.data as any;
        const revenueData = analytics.charts?.revenueTrend || [];

        return res.status(StatusCodes.OK).json(
          successResponse("Revenue analytics retrieved", {
            revenueData,
            totalRevenue: analytics.summary?.revenue || 0,
            growthRate: this.calculateGrowthRate(revenueData),
          }),
        );
      } else {
        return res.status(StatusCodes.OK).json(
          successResponse("Revenue analytics retrieved", {
            revenueData: [],
            totalRevenue: 0,
            growthRate: 0,
          }),
        );
      }
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get revenue analytics", error.message));
    }
  }

  async getUserAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { timeRange = "month" } = req.query;
      const result = await dashboardService.getAnalytics(timeRange as any);

      if (result.success && result.data) {
        const analytics = result.data as any;
        const userGrowth = analytics.charts?.userGrowth || [];

        return res.status(StatusCodes.OK).json(
          successResponse("User analytics retrieved", {
            userGrowth,
            totalUsers: analytics.summary?.newUsers || 0,
            growthRate: this.calculateGrowthRate(userGrowth),
            retentionRate: analytics.metrics?.userRetentionRate || 0,
          }),
        );
      } else {
        return res.status(StatusCodes.OK).json(
          successResponse("User analytics retrieved", {
            userGrowth: [],
            totalUsers: 0,
            growthRate: 0,
            retentionRate: 0,
          }),
        );
      }
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get user analytics", error.message));
    }
  }

  async getSalesAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const { timeRange = "month" } = req.query;
      const result = await dashboardService.getAnalytics(timeRange as any);

      if (result.success && result.data) {
        const analytics = result.data as any;

        return res.status(StatusCodes.OK).json(
          successResponse("Sales analytics retrieved", {
            topProducts: analytics.topProducts || [],
            categorySales: analytics.charts?.categorySales || [],
            totalOrders: analytics.summary?.newOrders || 0,
            averageOrderValue: analytics.metrics?.averageOrderValue || 0,
            conversionRate: analytics.metrics?.conversionRate || 0,
          }),
        );
      } else {
        return res.status(StatusCodes.OK).json(
          successResponse("Sales analytics retrieved", {
            topProducts: [],
            categorySales: [],
            totalOrders: 0,
            averageOrderValue: 0,
            conversionRate: 0,
          }),
        );
      }
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get sales analytics", error.message));
    }
  }

  private calculateGrowthRate(data: any[]): number {
    if (data.length < 2) return 0;

    const firstValue =
      data[0]?.value || data[0]?.users || data[0]?.revenue || 0;
    const lastValue =
      data[data.length - 1]?.value ||
      data[data.length - 1]?.users ||
      data[data.length - 1]?.revenue ||
      0;

    if (firstValue === 0) return lastValue > 0 ? 100 : 0;

    return ((lastValue - firstValue) / firstValue) * 100;
  }
}
