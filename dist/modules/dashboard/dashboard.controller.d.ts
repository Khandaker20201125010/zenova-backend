import { Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class DashboardController {
    getAdminDashboard(req: AuthRequest, res: Response): Promise<Response>;
    getUserDashboard(req: AuthRequest, res: Response): Promise<Response>;
    getManagerDashboard(req: AuthRequest, res: Response): Promise<Response>;
    getAnalytics(req: AuthRequest, res: Response): Promise<Response>;
    getSystemStatus(req: AuthRequest, res: Response): Promise<Response>;
    getRevenueAnalytics(req: AuthRequest, res: Response): Promise<Response>;
    getUserAnalytics(req: AuthRequest, res: Response): Promise<Response>;
    getSalesAnalytics(req: AuthRequest, res: Response): Promise<Response>;
    private calculateGrowthRate;
}
//# sourceMappingURL=dashboard.controller.d.ts.map