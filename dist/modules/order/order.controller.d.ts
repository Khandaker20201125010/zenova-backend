import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class OrderController {
    createOrder(req: AuthRequest, res: Response): Promise<Response>;
    getOrders(req: AuthRequest, res: Response): Promise<Response>;
    getOrderById(req: AuthRequest, res: Response): Promise<Response>;
    getOrderByNumber(req: AuthRequest, res: Response): Promise<Response>;
    updateOrderStatus(req: AuthRequest, res: Response): Promise<Response>;
    cancelOrder(req: AuthRequest, res: Response): Promise<Response>;
    createCheckoutSession(req: AuthRequest, res: Response): Promise<Response>;
    handleStripeWebhook(req: Request, res: Response): Promise<Response>;
    getOrderStats(req: AuthRequest, res: Response): Promise<Response>;
    getUserOrders(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=order.controller.d.ts.map