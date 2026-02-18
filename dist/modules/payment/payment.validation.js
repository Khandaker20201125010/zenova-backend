"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client"); // Import the enum
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive('Amount must be positive'),
        currency: zod_1.z.string().default('usd'),
        description: zod_1.z.string().optional(),
        orderId: zod_1.z.string().optional(),
    }),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.PaymentStatus), // Use nativeEnum for Prisma enums
    }),
});
//# sourceMappingURL=payment.validation.js.map