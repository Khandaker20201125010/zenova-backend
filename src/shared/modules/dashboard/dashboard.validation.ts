import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  query: z.object({
    timeRange: z.enum(['day', 'week', 'month', 'year']).default('month'),
    metric: z.enum(['revenue', 'orders', 'users', 'products']).default('revenue'),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
  }),
});

export const dashboardQuerySchema = z.object({
  query: z.object({
    timeRange: z.enum(['day', 'week', 'month', 'year']).default('month'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});