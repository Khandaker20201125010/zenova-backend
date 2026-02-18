import { z } from 'zod';
export declare const createReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        productId: z.ZodString;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        rating: z.ZodOptional<z.ZodNumber>;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=review.validation.d.ts.map