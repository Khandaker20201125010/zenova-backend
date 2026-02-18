import { z } from 'zod';
export declare const createNotificationSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        message: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<{
            INFO: "INFO";
            SUCCESS: "SUCCESS";
            WARNING: "WARNING";
            ERROR: "ERROR";
        }>>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const markAsReadSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateNotificationSchema: z.ZodObject<{
    body: z.ZodObject<{
        isRead: z.ZodOptional<z.ZodBoolean>;
        title: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            INFO: "INFO";
            SUCCESS: "SUCCESS";
            WARNING: "WARNING";
            ERROR: "ERROR";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=notification.validation.d.ts.map