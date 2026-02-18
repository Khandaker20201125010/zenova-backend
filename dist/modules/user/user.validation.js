"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTwoFactorSchema = exports.updateEmailSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(),
        bio: zod_1.z.string().max(500, 'Bio must be less than 500 characters').optional(),
        avatar: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    }),
});
exports.updateEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    }),
});
exports.toggleTwoFactorSchema = zod_1.z.object({
    body: zod_1.z.object({
        enabled: zod_1.z.boolean(),
    }),
});
//# sourceMappingURL=user.validation.js.map