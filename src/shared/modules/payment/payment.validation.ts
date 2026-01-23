import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().default('usd'),
    description: z.string().optional(),
    orderId: z.string().optional(),
  }),
});