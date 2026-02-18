import { z } from 'zod';
export declare const analyticsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        timeRange: z.ZodDefault<z.ZodEnum<{
            year: "year";
            week: "week";
            day: "day";
            month: "month";
        }>>;
        metric: z.ZodDefault<z.ZodEnum<{
            orders: "orders";
            users: "users";
            products: "products";
            revenue: "revenue";
        }>>;
        groupBy: z.ZodDefault<z.ZodEnum<{
            week: "week";
            day: "day";
            month: "month";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const dashboardQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        timeRange: z.ZodDefault<z.ZodEnum<{
            year: "year";
            week: "week";
            day: "day";
            month: "month";
        }>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=dashboard.validation.d.ts.map