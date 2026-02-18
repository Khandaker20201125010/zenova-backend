import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        shortDescription: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        discountedPrice: z.ZodOptional<z.ZodNumber>;
        categoryId: z.ZodString;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        features: z.ZodDefault<z.ZodArray<z.ZodString>>;
        specifications: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        stock: z.ZodDefault<z.ZodNumber>;
        isFeatured: z.ZodDefault<z.ZodBoolean>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        shortDescription: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        discountedPrice: z.ZodOptional<z.ZodNumber>;
        categoryId: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        features: z.ZodOptional<z.ZodArray<z.ZodString>>;
        specifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        stock: z.ZodOptional<z.ZodNumber>;
        isFeatured: z.ZodOptional<z.ZodBoolean>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        seoTitle: z.ZodOptional<z.ZodString>;
        seoDescription: z.ZodOptional<z.ZodString>;
        seoKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=product.validation.d.ts.map