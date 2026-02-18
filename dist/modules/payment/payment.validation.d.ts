import { z } from 'zod';
export declare const createPaymentSchema: z.ZodObject<{
    body: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        orderId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updatePaymentStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            PENDING: "PENDING";
            PAID: "PAID";
            FAILED: "FAILED";
            REFUNDED: "REFUNDED";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=payment.validation.d.ts.map