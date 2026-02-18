import { PaymentStatus } from '@prisma/client';
export interface CreatePaymentInput {
    amount: number;
    currency?: string;
    description?: string;
    orderId?: string;
}
export interface PaymentQueryParams {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    userId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=payment.interface.d.ts.map