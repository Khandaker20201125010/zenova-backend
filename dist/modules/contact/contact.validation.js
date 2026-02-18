"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaqSchema = exports.createFaqSchema = exports.updateContactMessageSchema = exports.createContactMessageSchema = void 0;
const zod_1 = require("zod");
exports.createContactMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        subject: zod_1.z.string().min(5, 'Subject must be at least 5 characters'),
        message: zod_1.z.string().min(10, 'Message must be at least 10 characters'),
    }),
});
exports.updateContactMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['UNREAD', 'READ', 'RESPONDED', 'ARCHIVED']).optional(),
        response: zod_1.z.string().optional(),
    }),
});
exports.createFaqSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string().min(5, 'Question must be at least 5 characters'),
        answer: zod_1.z.string().min(10, 'Answer must be at least 10 characters'),
        category: zod_1.z.string().min(1, 'Category is required'),
        order: zod_1.z.number().int().default(0),
        isActive: zod_1.z.boolean().default(true),
    }),
});
exports.updateFaqSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string().min(5).optional(),
        answer: zod_1.z.string().min(10).optional(),
        category: zod_1.z.string().min(1).optional(),
        order: zod_1.z.number().int().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=contact.validation.js.map