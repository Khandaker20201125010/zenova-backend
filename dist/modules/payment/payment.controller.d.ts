import { Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class PaymentController {
    createPaymentIntent(req: AuthRequest, res: Response): Promise<Response>;
    getPayments(req: AuthRequest, res: Response): Promise<Response>;
    getPaymentById(req: AuthRequest, res: Response): Promise<Response>;
    updatePaymentStatus(req: AuthRequest, res: Response): Promise<Response>;
    getPaymentStats(req: AuthRequest, res: Response): Promise<Response>;
    refundPayment(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=payment.controller.d.ts.map