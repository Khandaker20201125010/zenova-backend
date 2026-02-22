import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { ApiResponse } from "../../shared/types";
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogQueryParams,
} from "./blog.interface";

// Helper function to safely convert any value to boolean
function toBoolean(value: any): boolean {
  if (value === undefined || value === null) {
    return true; // Default value
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const str = value.toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'yes';
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return true; // Default for any other type
}

// Helper function to safely convert to number
function toNumber(value: any, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  const num = Number(value);
  return !isNaN(num) && num > 0 ? num : defaultValue;
}

export class BlogService {
  async createPost(
    userId: string,
    data: CreateBlogPostInput,
  ): Promise<ApiResponse> {
    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });

      const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

      // Prepare data for Prisma - match schema field names
      const postData: any = {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        authorId: userId,
        category: data.category || null,
        tags: data.tags || [],
        isPublished: data.isPublished || false,
        publishedAt: data.isPublished ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || [],
      };

      const post = await prisma.blogPost.create({
        data: postData,
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
      await prisma.activity.create({
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
    } catch (error: any) {
      logger.error("Create blog post error:", error);
      throw error;
    }
  }

  async getPosts(params: BlogQueryParams): Promise<ApiResponse> {
    try {
      // Use helper functions to safely convert values
      const page = toNumber(params.page, 1);
      const limit = toNumber(params.limit, 10);
      
      // Ensure valid numbers with bounds
      const validPage = Math.max(1, page);
      const validLimit = Math.min(100, Math.max(1, limit));
      
      const skip = (validPage - 1) * validLimit;

      // Parse sortOrder
      const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
      
      // Build where clause
      const where: any = {};

      // Handle isPublished - use helper function
      where.isPublished = toBoolean(params.isPublished);

      if (params.search) {
        where.OR = [
          { title: { contains: params.search, mode: "insensitive" } },
          { excerpt: { contains: params.search, mode: "insensitive" } },
          { content: { contains: params.search, mode: "insensitive" } },
        ];
      }

      if (params.category) {
        where.category = params.category;
      }

      if (params.tags && params.tags.length > 0) {
        // Handle tags that might come as string or array
        const tagsArray = Array.isArray(params.tags) 
          ? params.tags 
          : [params.tags];
        where.tags = { hasSome: tagsArray };
      }

      if (params.authorId) {
        where.authorId = params.authorId;
      }

      // Determine sort field
      const sortField = params.sortBy || "createdAt";
      
      // Get posts
      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
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
          take: validLimit,
          orderBy: { [sortField]: sortOrder },
        }),
        prisma.blogPost.count({ where }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      // Return in the format frontend expects
      return {
        success: true,
        message: "Blog posts retrieved successfully",
        data: {
          posts: posts,
          total,
          page: validPage,
          limit: validLimit,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error("Get blog posts error:", error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<ApiResponse> {
    try {
      const post = await prisma.blogPost.findUnique({
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
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });

      return {
        success: true,
        message: "Blog post retrieved successfully",
        data: post,
      };
    } catch (error: any) {
      logger.error("Get blog post by slug error:", error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<ApiResponse> {
    try {
      const post = await prisma.blogPost.findUnique({
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
    } catch (error: any) {
      logger.error("Get blog post by ID error:", error);
      throw error;
    }
  }

  async updatePost(
    id: string,
    userId: string,
    data: UpdateBlogPostInput,
  ): Promise<ApiResponse> {
    try {
      const post = await prisma.blogPost.findUnique({
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
          message: "Not authorized to update this post",
        };
      }

      // Prepare update data
      const updateData: any = { ...data };

      // If title is updated, update slug
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

      const updatedPost = await prisma.blogPost.update({
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
      await prisma.activity.create({
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
    } catch (error: any) {
      logger.error("Update blog post error:", error);
      throw error;
    }
  }

  async deletePost(id: string, userId: string): Promise<ApiResponse> {
    try {
      const post = await prisma.blogPost.findUnique({
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

      await prisma.blogPost.delete({
        where: { id },
      });

      // Log activity
      await prisma.activity.create({
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
    } catch (error: any) {
      logger.error("Delete blog post error:", error);
      throw error;
    }
  }

  async getFeaturedPosts(limit: number = 5): Promise<ApiResponse> {
    try {
      // Use helper function
      const validLimit = Math.min(100, Math.max(1, toNumber(limit, 5)));
      
      const posts = await prisma.blogPost.findMany({
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
        take: validLimit,
        orderBy: { views: "desc" },
      });

      return {
        success: true,
        message: "Featured posts retrieved successfully",
        data: posts,
      };
    } catch (error: any) {
      logger.error("Get featured posts error:", error);
      throw error;
    }
  }

  async getRecentPosts(limit: number = 5): Promise<ApiResponse> {
    try {
      // Use helper function
      const validLimit = Math.min(100, Math.max(1, toNumber(limit, 5)));
      
      const posts = await prisma.blogPost.findMany({
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
        take: validLimit,
        orderBy: { publishedAt: "desc" },
      });

      return {
        success: true,
        message: "Recent posts retrieved successfully",
        data: posts,
      };
    } catch (error: any) {
      logger.error("Get recent posts error:", error);
      throw error;
    }
  }

  async getCategories(): Promise<ApiResponse> {
    try {
      const categories = await prisma.blogPost.groupBy({
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

      // Transform to simple array of category names
      const categoryNames = categories
        .map(c => c.category)
        .filter((c): c is string => c !== null);

      return {
        success: true,
        message: "Categories retrieved successfully",
        data: categoryNames,
      };
    } catch (error: any) {
      logger.error("Get categories error:", error);
      throw error;
    }
  }

  async getTags(): Promise<ApiResponse> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { tags: true },
      });

      const allTags = posts.flatMap((post) => post.tags);
      const uniqueTags = [...new Set(allTags)];

      return {
        success: true,
        message: "Tags retrieved successfully",
        data: uniqueTags,
      };
    } catch (error: any) {
      logger.error("Get tags error:", error);
      throw error;
    }
  }

  async getBlogStats(): Promise<ApiResponse> {
    try {
      const [
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalAuthors,
        recentPosts,
      ] = await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { isPublished: true } }),
        prisma.blogPost.count({ where: { isPublished: false } }),
        prisma.blogPost.aggregate({
          _sum: { views: true },
        }),
        prisma.blogPost
          .groupBy({
            by: ["authorId"],
          })
          .then((results) => results.length),
        prisma.blogPost.findMany({
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
    } catch (error: any) {
      logger.error("Get blog stats error:", error);
      throw error;
    }
  }
}