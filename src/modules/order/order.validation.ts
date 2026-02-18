// validation/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
      price: z.number().positive('Price must be positive'),
    })).min(1, 'At least one item is required'),
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      phone: z.string().min(1, 'Phone is required'),
    }),
    billingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      phone: z.string().min(1, 'Phone is required'),
    }).optional(),
    tax: z.number().min(0, 'Tax cannot be negative').default(0),
    shipping: z.number().min(0, 'Shipping cannot be negative').default(0),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    notes: z.string().optional(),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().default('usd'),
    description: z.string().optional(),
  }),
});