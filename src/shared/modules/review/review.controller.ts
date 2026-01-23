import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ReviewService } from './review.service';
import { AuthRequest } from '../../types';
import { errorResponse } from '../../helpers/apiResponse';

const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      const { productId, rating, comment } = req.body;
      const result = await reviewService.createReview(req.user.id, productId, rating, comment);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create review', error.message)
      );
    }
  }

  async getProductReviews(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for productId
      const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await reviewService.getProductReviews(
        productId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get product reviews', error.message)
      );
    }
  }

  async getUserReviews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await reviewService.getUserReviews(
        req.user.id,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get user reviews', error.message)
      );
    }
  }

  async updateReview(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await reviewService.updateReview(id, req.user.id, req.body);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update review', error.message)
      );
    }
  }

  async deleteReview(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await reviewService.deleteReview(id, req.user.id);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to delete review', error.message)
      );
    }
  }

  async getRecentReviews(req: Request, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const result = await reviewService.getRecentReviews(limit);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get recent reviews', error.message)
      );
    }
  }

  async getReviewStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorResponse('Insufficient permissions')
        );
      }

      const result = await reviewService.getReviewStats();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get review stats', error.message)
      );
    }
  }

  async getAllReviews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorResponse('Insufficient permissions')
        );
      }

      const { page = 1, limit = 20 } = req.query;
      const result = await reviewService.getAllReviews(
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get all reviews', error.message)
      );
    }
  }
}