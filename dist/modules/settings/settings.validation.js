"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemSettingsSchema = exports.updateSettingSchema = void 0;
const zod_1 = require("zod");
exports.updateSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        key: zod_1.z.string().min(1, 'Key is required'),
        value: zod_1.z.any(),
        type: zod_1.z.string().optional(),
    }),
});
exports.updateSystemSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        site: zod_1.z.object({
            name: zod_1.z.string().min(1).optional(),
            description: zod_1.z.string().optional(),
            logo: zod_1.z.string().url().optional(),
            favicon: zod_1.z.string().url().optional(),
            theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
            language: zod_1.z.string().optional(),
            timezone: zod_1.z.string().optional(),
            currency: zod_1.z.string().optional(),
        }).optional(),
        email: zod_1.z.object({
            enabled: zod_1.z.boolean().optional(),
            fromName: zod_1.z.string().optional(),
            fromEmail: zod_1.z.string().email().optional(),
            smtpHost: zod_1.z.string().optional(),
            smtpPort: zod_1.z.number().optional(),
            smtpUser: zod_1.z.string().optional(),
            smtpPass: zod_1.z.string().optional(),
        }).optional(),
        payment: zod_1.z.object({
            stripeEnabled: zod_1.z.boolean().optional(),
            stripePublicKey: zod_1.z.string().optional(),
            stripeSecretKey: zod_1.z.string().optional(),
            currency: zod_1.z.string().optional(),
        }).optional(),
        storage: zod_1.z.object({
            provider: zod_1.z.string().optional(),
            cloudinaryCloudName: zod_1.z.string().optional(),
            cloudinaryApiKey: zod_1.z.string().optional(),
            cloudinaryApiSecret: zod_1.z.string().optional(),
        }).optional(),
        social: zod_1.z.object({
            facebook: zod_1.z.string().url().optional(),
            twitter: zod_1.z.string().url().optional(),
            instagram: zod_1.z.string().url().optional(),
            linkedin: zod_1.z.string().url().optional(),
            github: zod_1.z.string().url().optional(),
        }).optional(),
        analytics: zod_1.z.object({
            googleAnalyticsId: zod_1.z.string().optional(),
            facebookPixelId: zod_1.z.string().optional(),
        }).optional(),
        security: zod_1.z.object({
            requireEmailVerification: zod_1.z.boolean().optional(),
            requireStrongPasswords: zod_1.z.boolean().optional(),
            maxLoginAttempts: zod_1.z.number().int().positive().optional(),
            sessionTimeout: zod_1.z.number().int().positive().optional(),
        }).optional(),
        features: zod_1.z.object({
            enableBlog: zod_1.z.boolean().optional(),
            enableReviews: zod_1.z.boolean().optional(),
            enableNotifications: zod_1.z.boolean().optional(),
            enableTwoFactor: zod_1.z.boolean().optional(),
        }).optional(),
    }),
});
//# sourceMappingURL=settings.validation.js.map