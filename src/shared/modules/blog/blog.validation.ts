import { z } from 'zod';

export const createBlogPostSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    excerpt: z.string().max(200, 'Excerpt must be less than 200 characters').optional(),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    coverImage: z.string().url('Invalid URL').optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    isPublished: z.boolean().default(false),
    publishedAt: z.string().datetime().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).default([]),
  }),
});

export const updateBlogPostSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    excerpt: z.string().max(200).optional(),
    content: z.string().min(50).optional(),
    coverImage: z.string().url().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
  }),
});