"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardQuerySchema = exports.analyticsQuerySchema = void 0;
const zod_1 = require("zod");
exports.analyticsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        timeRange: zod_1.z.enum(['day', 'week', 'month', 'year']).default('month'),
        metric: zod_1.z.enum(['revenue', 'orders', 'users', 'products']).default('revenue'),
        groupBy: zod_1.z.enum(['day', 'week', 'month']).default('day'),
    }),
});
exports.dashboardQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        timeRange: zod_1.z.enum(['day', 'week', 'month', 'year']).default('month'),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
});
//# sourceMappingURL=dashboard.validation.js.map