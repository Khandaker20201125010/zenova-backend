import { z } from 'zod';
export declare const createContactMessageSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        subject: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateContactMessageSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<{
            UNREAD: "UNREAD";
            READ: "READ";
            RESPONDED: "RESPONDED";
            ARCHIVED: "ARCHIVED";
        }>>;
        response: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createFaqSchema: z.ZodObject<{
    body: z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
        category: z.ZodString;
        order: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateFaqSchema: z.ZodObject<{
    body: z.ZodObject<{
        question: z.ZodOptional<z.ZodString>;
        answer: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=contact.validation.d.ts.map