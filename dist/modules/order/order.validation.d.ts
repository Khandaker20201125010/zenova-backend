import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
            price: z.ZodNumber;
        }, z.core.$strip>>;
        shippingAddress: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            country: z.ZodString;
            postalCode: z.ZodString;
            phone: z.ZodString;
        }, z.core.$strip>;
        billingAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            country: z.ZodString;
            postalCode: z.ZodString;
            phone: z.ZodString;
        }, z.core.$strip>>;
        tax: z.ZodDefault<z.ZodNumber>;
        shipping: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            PENDING: "PENDING";
            REFUNDED: "REFUNDED";
            PROCESSING: "PROCESSING";
            SHIPPED: "SHIPPED";
            DELIVERED: "DELIVERED";
            CANCELLED: "CANCELLED";
        }>;
        paymentStatus: z.ZodOptional<z.ZodEnum<{
            PENDING: "PENDING";
            PAID: "PAID";
            FAILED: "FAILED";
            REFUNDED: "REFUNDED";
        }>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createPaymentSchema: z.ZodObject<{
    body: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=order.validation.d.ts.map