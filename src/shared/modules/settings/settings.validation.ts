import { z } from 'zod';

export const updateSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.any(),
    type: z.string().optional(),
  }),
});

export const updateSystemSettingsSchema = z.object({
  body: z.object({
    site: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      logo: z.string().url().optional(),
      favicon: z.string().url().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
      currency: z.string().optional(),
    }).optional(),
    email: z.object({
      enabled: z.boolean().optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
      smtpHost: z.string().optional(),
      smtpPort: z.number().optional(),
      smtpUser: z.string().optional(),
      smtpPass: z.string().optional(),
    }).optional(),
    payment: z.object({
      stripeEnabled: z.boolean().optional(),
      stripePublicKey: z.string().optional(),
      stripeSecretKey: z.string().optional(),
      currency: z.string().optional(),
    }).optional(),
    storage: z.object({
      provider: z.string().optional(),
      cloudinaryCloudName: z.string().optional(),
      cloudinaryApiKey: z.string().optional(),
      cloudinaryApiSecret: z.string().optional(),
    }).optional(),
    social: z.object({
      facebook: z.string().url().optional(),
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    }).optional(),
    analytics: z.object({
      googleAnalyticsId: z.string().optional(),
      facebookPixelId: z.string().optional(),
    }).optional(),
    security: z.object({
      requireEmailVerification: z.boolean().optional(),
      requireStrongPasswords: z.boolean().optional(),
      maxLoginAttempts: z.number().int().positive().optional(),
      sessionTimeout: z.number().int().positive().optional(),
    }).optional(),
    features: z.object({
      enableBlog: z.boolean().optional(),
      enableReviews: z.boolean().optional(),
      enableNotifications: z.boolean().optional(),
      enableTwoFactor: z.boolean().optional(),
    }).optional(),
  }),
});