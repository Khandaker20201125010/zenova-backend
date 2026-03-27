import { z } from 'zod';

// Fix: z.record() needs type arguments
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    shortDescription: z.string().max(200).optional().nullable(),
    price: z.number().positive('Price must be positive'),
    discountedPrice: z.number().positive().optional().nullable(),
    categoryId: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    specifications: z.record(z.string(), z.any()).optional().default({}),
    stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
    isFeatured: z.boolean().default(false),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    seoKeywords: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    shortDescription: z.string().max(200).optional().nullable(),
    price: z.number().positive().optional(),
    discountedPrice: z.number().positive().optional().nullable(),
    categoryId: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    specifications: z.record(z.string(), z.any()).optional(),
    stock: z.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    seoKeywords: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});