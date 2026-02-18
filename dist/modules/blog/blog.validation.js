"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogPostSchema = exports.createBlogPostSchema = void 0;
const zod_1 = require("zod");
exports.createBlogPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
        excerpt: zod_1.z.string().max(200, 'Excerpt must be less than 200 characters').optional(),
        content: zod_1.z.string().min(50, 'Content must be at least 50 characters'),
        coverImage: zod_1.z.string().url('Invalid URL').optional(),
        category: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        isPublished: zod_1.z.boolean().default(false),
        publishedAt: zod_1.z.string().datetime().optional(),
        seoTitle: zod_1.z.string().optional(),
        seoDescription: zod_1.z.string().optional(),
        seoKeywords: zod_1.z.array(zod_1.z.string()).default([]),
    }),
});
exports.updateBlogPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5).optional(),
        excerpt: zod_1.z.string().max(200).optional(),
        content: zod_1.z.string().min(50).optional(),
        coverImage: zod_1.z.string().url().optional(),
        category: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        isPublished: zod_1.z.boolean().optional(),
        publishedAt: zod_1.z.string().datetime().optional(),
        seoTitle: zod_1.z.string().optional(),
        seoDescription: zod_1.z.string().optional(),
        seoKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
//# sourceMappingURL=blog.validation.js.map