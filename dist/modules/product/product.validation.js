"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
// Fix: z.record() needs type arguments
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
        shortDescription: zod_1.z.string().max(200, 'Short description must be less than 200 characters').optional(),
        price: zod_1.z.number().positive('Price must be positive'),
        discountedPrice: zod_1.z.number().positive('Discounted price must be positive').optional(),
        categoryId: zod_1.z.string().min(1, 'Category is required'),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        features: zod_1.z.array(zod_1.z.string()).default([]),
        specifications: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().default({}),
        stock: zod_1.z.number().int().min(0, 'Stock cannot be negative').default(0),
        isFeatured: zod_1.z.boolean().default(false),
        seoTitle: zod_1.z.string().optional(),
        seoDescription: zod_1.z.string().optional(),
        seoKeywords: zod_1.z.array(zod_1.z.string()).default([]),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(10).optional(),
        shortDescription: zod_1.z.string().max(200).optional(),
        price: zod_1.z.number().positive().optional(),
        discountedPrice: zod_1.z.number().positive().optional(),
        categoryId: zod_1.z.string().min(1).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        specifications: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        stock: zod_1.z.number().int().min(0).optional(),
        isFeatured: zod_1.z.boolean().optional(),
        isActive: zod_1.z.boolean().optional(),
        seoTitle: zod_1.z.string().optional(),
        seoDescription: zod_1.z.string().optional(),
        seoKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
//# sourceMappingURL=product.validation.js.map