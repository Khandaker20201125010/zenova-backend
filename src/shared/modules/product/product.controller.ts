import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProductService } from './product.service';
import { AuthRequest } from '../../types';
import { errorMessageResponse, errorResponse } from '../../helpers/apiResponse';

const productService = new ProductService();

export class ProductController {
  async createProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      const result = await productService.createProduct(req.body);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create product', error.message)
      );
    }
  }

  async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const result = await productService.getProducts(req.query);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get products', error.message)
      );
    }
  }

  async getProductBySlug(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for slug
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const result = await productService.getProductBySlug(slug);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get product', error.message)
      );
    }
  }

  async getProductById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.getProductById(id);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get product', error.message)
      );
    }
  }

  async updateProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.updateProduct(id, req.body);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update product', error.message)
      );
    }
  }

  async deleteProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.deleteProduct(id);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to delete product', error.message)
      );
    }
  }

  async uploadProductImages(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorMessageResponse('No files uploaded')
        );
      }

      const imageUrls = files.map(file => (file as any).secure_url);
      const result = await productService.uploadProductImages(id, imageUrls);
      
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to upload images', error.message)
      );
    }
  }

  async removeProductImage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorMessageResponse('Image URL is required')
        );
      }

      const result = await productService.removeProductImage(id, imageUrl);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to remove image', error.message)
      );
    }
  }

  async getRelatedProducts(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      
      const result = await productService.getRelatedProducts(id, limit);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get related products', error.message)
      );
    }
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<Response> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      
      const result = await productService.getFeaturedProducts(limit);
      
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get featured products', error.message)
      );
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorMessageResponse('Authentication required')
        );
      }

      const { productId } = req.body;
      
      if (!productId) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorMessageResponse('Product ID is required')
        );
      }

      const result = await productService.toggleFavorite(req.user.id, productId);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to toggle favorite', error.message)
      );
    }
  }

  async getUserFavorites(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorMessageResponse('Authentication required')
        );
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      
      const result = await productService.getUserFavorites(req.user.id, page, limit);
      
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get favorites', error.message)
      );
    }
  }

  async getProductStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorMessageResponse('Insufficient permissions')
        );
      }

      const result = await productService.getProductStats();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get product stats', error.message)
      );
    }
  }
}