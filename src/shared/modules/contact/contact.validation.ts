import { z } from 'zod';

export const createContactMessageSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
});

export const updateContactMessageSchema = z.object({
  body: z.object({
    status: z.enum(['UNREAD', 'READ', 'RESPONDED', 'ARCHIVED']).optional(),
    response: z.string().optional(),
  }),
});

export const createFaqSchema = z.object({
  body: z.object({
    question: z.string().min(5, 'Question must be at least 5 characters'),
    answer: z.string().min(10, 'Answer must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateFaqSchema = z.object({
  body: z.object({
    question: z.string().min(5).optional(),
    answer: z.string().min(10).optional(),
    category: z.string().min(1).optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});