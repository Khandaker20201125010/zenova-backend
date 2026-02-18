import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        avatar: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEmailSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        currentPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const toggleTwoFactorSchema: z.ZodObject<{
    body: z.ZodObject<{
        enabled: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=user.validation.d.ts.map