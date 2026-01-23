import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
});

export const updateEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    currentPassword: z.string().min(1, 'Current password is required'),
  }),
});

export const toggleTwoFactorSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
  }),
});