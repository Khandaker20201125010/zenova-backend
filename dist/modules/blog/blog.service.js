"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
class BlogService {
    async createPost(userId, data) {
        try {
            // Generate slug from title
            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            // Check if slug exists
            const existingPost = await prisma_1.prisma.blogPost.findUnique({
                where: { slug },
            });
            if (existingPost) {
                // Add timestamp to make slug unique
                data.title = `${data.title} (${new Date().toLocaleDateString()})`;
            }
            const post = await prisma_1.prisma.blogPost.create({
                data: {
                    ...data,
                    slug: existingPost ? `${slug}-${Date.now()}` : slug,
                    authorId: userId,
                    publishedAt: data.isPublished ? new Date() : null,
                    seoKeywords: data.seoKeywords || [],
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            position: true,
                        },
                    },
                },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId,
                    action: "CREATE_BLOG_POST",
                    entity: "BLOG_POST",
                    entityId: post.id,
                },
            });
            return {
                success: true,
                message: "Blog post created successfully",
                data: post,
            };
        }
        catch (error) {
            logger_1.default.error("Create blog post error:", error);
            throw error;
        }
    }
    async getPosts(params) {
        try {
            const { page = 1, limit = 10, search, category, tags, isPublished = true, authorId, sortBy = "createdAt", sortOrder = "desc", } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            if (isPublished !== undefined) {
                where.isPublished = isPublished;
            }
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { excerpt: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ];
            }
            if (category) {
                where.category = category;
            }
            if (tags && tags.length > 0) {
                where.tags = { hasSome: tags };
            }
            if (authorId) {
                where.authorId = authorId;
            }
            // Get posts
            const [posts, total] = await Promise.all([
                prisma_1.prisma.blogPost.findMany({
                    where,
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                position: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                }),
                prisma_1.prisma.blogPost.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Blog posts retrieved successfully",
                data: posts,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get blog posts error:", error);
            throw error;
        }
    }
    async getPostBySlug(slug) {
        try {
            const post = await prisma_1.prisma.blogPost.findUnique({
                where: { slug },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            position: true,
                            bio: true,
                        },
                    },
                },
            });
            if (!post) {
                return {
                    success: false,
                    message: "Blog post not found",
                };
            }
            // Increment view count
            await prisma_1.prisma.blogPost.update({
                where: { id: post.id },
                data: { views: { increment: 1 } },
            });
            return {
                success: true,
                message: "Blog post retrieved successfully",
                data: post,
            };
        }
        catch (error) {
            logger_1.default.error("Get blog post by slug error:", error);
            throw error;
        }
    }
    async getPostById(id) {
        try {
            const post = await prisma_1.prisma.blogPost.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            });
            if (!post) {
                return {
                    success: false,
                    message: "Blog post not found",
                };
            }
            return {
                success: true,
                message: "Blog post retrieved successfully",
                data: post,
            };
        }
        catch (error) {
            logger_1.default.error("Get blog post by ID error:", error);
            throw error;
        }
    }
    async updatePost(id, userId, data) {
        try {
            const post = await prisma_1.prisma.blogPost.findUnique({
                where: { id },
            });
            if (!post) {
                return {
                    success: false,
                    message: "Blog post not found",
                };
            }
            // Check if user is author or admin
            if (post.authorId !== userId) {
                // Check if user is admin (this would be done in controller)
                return {
                    success: false,
                    message: "Not authorized to update this post",
                };
            }
            // If title is updated, update slug
            let updateData = data;
            if (data.title && data.title !== post.title) {
                const slug = data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                updateData.slug = `${slug}-${Date.now()}`;
            }
            // If publishing for the first time
            if (data.isPublished && !post.isPublished) {
                updateData.publishedAt = new Date();
            }
            const updatedPost = await prisma_1.prisma.blogPost.update({
                where: { id },
                data: updateData,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId,
                    action: "UPDATE_BLOG_POST",
                    entity: "BLOG_POST",
                    entityId: id,
                },
            });
            return {
                success: true,
                message: "Blog post updated successfully",
                data: updatedPost,
            };
        }
        catch (error) {
            logger_1.default.error("Update blog post error:", error);
            throw error;
        }
    }
    async deletePost(id, userId) {
        try {
            const post = await prisma_1.prisma.blogPost.findUnique({
                where: { id },
            });
            if (!post) {
                return {
                    success: false,
                    message: "Blog post not found",
                };
            }
            // Check if user is author or admin
            if (post.authorId !== userId) {
                return {
                    success: false,
                    message: "Not authorized to delete this post",
                };
            }
            await prisma_1.prisma.blogPost.delete({
                where: { id },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId,
                    action: "DELETE_BLOG_POST",
                    entity: "BLOG_POST",
                    entityId: id,
                },
            });
            return {
                success: true,
                message: "Blog post deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete blog post error:", error);
            throw error;
        }
    }
    async getFeaturedPosts(limit = 5) {
        try {
            const posts = await prisma_1.prisma.blogPost.findMany({
                where: {
                    isPublished: true,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                take: limit,
                orderBy: { views: "desc" },
            });
            return {
                success: true,
                message: "Featured posts retrieved successfully",
                data: posts,
            };
        }
        catch (error) {
            logger_1.default.error("Get featured posts error:", error);
            throw error;
        }
    }
    async getRecentPosts(limit = 5) {
        try {
            const posts = await prisma_1.prisma.blogPost.findMany({
                where: {
                    isPublished: true,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                take: limit,
                orderBy: { publishedAt: "desc" },
            });
            return {
                success: true,
                message: "Recent posts retrieved successfully",
                data: posts,
            };
        }
        catch (error) {
            logger_1.default.error("Get recent posts error:", error);
            throw error;
        }
    }
    async getCategories() {
        try {
            const categories = await prisma_1.prisma.blogPost.groupBy({
                by: ["category"],
                where: {
                    category: { not: null },
                    isPublished: true,
                },
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: "desc",
                    },
                },
            });
            return {
                success: true,
                message: "Categories retrieved successfully",
                data: categories,
            };
        }
        catch (error) {
            logger_1.default.error("Get categories error:", error);
            throw error;
        }
    }
    async getTags() {
        try {
            const posts = await prisma_1.prisma.blogPost.findMany({
                where: { isPublished: true },
                select: { tags: true },
            });
            const allTags = posts.flatMap((post) => post.tags);
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});
            const tags = Object.entries(tagCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
            return {
                success: true,
                message: "Tags retrieved successfully",
                data: tags,
            };
        }
        catch (error) {
            logger_1.default.error("Get tags error:", error);
            throw error;
        }
    }
    async getBlogStats() {
        try {
            const [totalPosts, publishedPosts, draftPosts, totalViews, totalAuthors, recentPosts,] = await Promise.all([
                prisma_1.prisma.blogPost.count(),
                prisma_1.prisma.blogPost.count({ where: { isPublished: true } }),
                prisma_1.prisma.blogPost.count({ where: { isPublished: false } }),
                prisma_1.prisma.blogPost.aggregate({
                    _sum: { views: true },
                }),
                prisma_1.prisma.blogPost
                    .groupBy({
                    by: ["authorId"],
                    _count: true,
                })
                    .then((results) => results.length),
                prisma_1.prisma.blogPost.findMany({
                    where: { isPublished: true },
                    take: 5,
                    orderBy: { publishedAt: "desc" },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                }),
            ]);
            const stats = {
                totalPosts,
                publishedPosts,
                draftPosts,
                totalViews: totalViews._sum.views || 0,
                totalAuthors,
                recentPosts,
            };
            return {
                success: true,
                message: "Blog stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            logger_1.default.error("Get blog stats error:", error);
            throw error;
        }
    }
}
exports.BlogService = BlogService;
//# sourceMappingURL=blog.service.js.map