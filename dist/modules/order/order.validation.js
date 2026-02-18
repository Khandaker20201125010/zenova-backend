"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().min(1, 'Product ID is required'),
            quantity: zod_1.z.number().int().positive('Quantity must be positive'),
            price: zod_1.z.number().positive('Price must be positive'),
        })).min(1, 'At least one item is required'),
        shippingAddress: zod_1.z.object({
            street: zod_1.z.string().min(1, 'Street is required'),
            city: zod_1.z.string().min(1, 'City is required'),
            state: zod_1.z.string().min(1, 'State is required'),
            country: zod_1.z.string().min(1, 'Country is required'),
            postalCode: zod_1.z.string().min(1, 'Postal code is required'),
            phone: zod_1.z.string().min(1, 'Phone is required'),
        }),
        billingAddress: zod_1.z.object({
            street: zod_1.z.string().min(1, 'Street is required'),
            city: zod_1.z.string().min(1, 'City is required'),
            state: zod_1.z.string().min(1, 'State is required'),
            country: zod_1.z.string().min(1, 'Country is required'),
            postalCode: zod_1.z.string().min(1, 'Postal code is required'),
            phone: zod_1.z.string().min(1, 'Phone is required'),
        }).optional(),
        tax: zod_1.z.number().min(0, 'Tax cannot be negative').default(0),
        shipping: zod_1.z.number().min(0, 'Shipping cannot be negative').default(0),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
        paymentStatus: zod_1.z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive('Amount must be positive'),
        currency: zod_1.z.string().default('usd'),
        description: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=order.validation.js.map