import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).default('INFO'),
    data: z.record(z.string(), z.any()).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
});

export const updateNotificationSchema = z.object({
  body: z.object({
    isRead: z.boolean().optional(),
    title: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
  }),
});