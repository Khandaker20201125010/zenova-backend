import { z } from 'zod';
import { PaymentStatus } from '@prisma/client'; // Import the enum

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().default('usd'),
    description: z.string().optional(),
    orderId: z.string().optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(PaymentStatus), // Use nativeEnum for Prisma enums
  }),
});