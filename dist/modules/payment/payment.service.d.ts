import { ApiResponse } from "../../shared/types";
import { CreatePaymentInput, PaymentQueryParams } from "./payment.interface";
export declare class PaymentService {
    createPaymentIntent(userId: string, data: CreatePaymentInput): Promise<ApiResponse>;
    getPayments(params: PaymentQueryParams, userId?: string): Promise<ApiResponse>;
    getPaymentById(id: string, userId?: string): Promise<ApiResponse>;
    updatePaymentStatus(id: string, status: string): Promise<ApiResponse>;
    getPaymentStats(userId?: string): Promise<ApiResponse>;
    refundPayment(id: string): Promise<ApiResponse>;
}
//# sourceMappingURL=payment.service.d.ts.map