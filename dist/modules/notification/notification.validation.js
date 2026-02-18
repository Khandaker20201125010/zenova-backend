"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationSchema = exports.markAsReadSchema = exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        message: zod_1.z.string().min(1, 'Message is required'),
        type: zod_1.z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).default('INFO'),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.markAsReadSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Notification ID is required'),
    }),
});
exports.updateNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        isRead: zod_1.z.boolean().optional(),
        title: zod_1.z.string().min(1).optional(),
        message: zod_1.z.string().min(1).optional(),
        type: zod_1.z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
    }),
});
//# sourceMappingURL=notification.validation.js.map