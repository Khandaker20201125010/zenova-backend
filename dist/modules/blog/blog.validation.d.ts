import { z } from 'zod';
export declare const createBlogPostSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        coverImage: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        isPublished: z.ZodDefault<z.ZodBoolean>;
        publishedAt: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateBlogPostSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        excerpt: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        coverImage: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        publishedAt: z.ZodOptional<z.ZodString>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=blog.validation.d.ts.map