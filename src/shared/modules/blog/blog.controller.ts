import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BlogService } from './blog.service';
import { AuthRequest } from '../../types';
import { errorResponse, successResponse } from '../../helpers/apiResponse';

const blogService = new BlogService();

export class BlogController {
  async createPost(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      const result = await blogService.createPost(req.user.id, req.body);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create blog post', error.message)
      );
    }
  }

  async getPosts(req: Request, res: Response): Promise<Response> {
    try {
      const result = await blogService.getPosts(req.query);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get blog posts', error.message)
      );
    }
  }

  async getPostBySlug(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for slug
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const result = await blogService.getPostBySlug(slug);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get blog post', error.message)
      );
    }
  }

  async getPostById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await blogService.getPostById(id);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get blog post', error.message)
      );
    }
  }

  async updatePost(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await blogService.updatePost(id, req.user.id, req.body);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update blog post', error.message)
      );
    }
  }

  async deletePost(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await blogService.deletePost(id, req.user.id);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to delete blog post', error.message)
      );
    }
  }

  async getFeaturedPosts(req: Request, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const result = await blogService.getFeaturedPosts(limit);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get featured posts', error.message)
      );
    }
  }

  async getRecentPosts(req: Request, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const result = await blogService.getRecentPosts(limit);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get recent posts', error.message)
      );
    }
  }

  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const result = await blogService.getCategories();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get categories', error.message)
      );
    }
  }

  async getTags(req: Request, res: Response): Promise<Response> {
    try {
      const result = await blogService.getTags();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get tags', error.message)
      );
    }
  }

  async getBlogStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorResponse('Insufficient permissions')
        );
      }

      const result = await blogService.getBlogStats();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get blog stats', error.message)
      );
    }
  }

  async uploadCoverImage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorResponse('No file uploaded')
        );
      }

      const imageUrl = (req.file as any).secure_url;
      return res.status(StatusCodes.OK).json(
        successResponse('Image uploaded successfully', { url: imageUrl })
      );
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to upload image', error.message)
      );
    }
  }
}