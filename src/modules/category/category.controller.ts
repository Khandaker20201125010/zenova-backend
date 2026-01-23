import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CategoryService } from "./category.service";
import { AuthRequest } from "../../shared/types";
import { errorResponse } from "../../shared/helpers/apiResponse";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await categoryService.createCategory(req.body);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create category", error.message));
    }
  }

  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const { includeProducts } = req.query;
      const result = await categoryService.getCategories(
        includeProducts === "true",
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get categories", error.message));
    }
  }

  async getCategoryBySlug(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for slug
      const slug = Array.isArray(req.params.slug)
        ? req.params.slug[0]
        : req.params.slug;
      const result = await categoryService.getCategoryBySlug(slug);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get category", error.message));
    }
  }

  async updateCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await categoryService.updateCategory(id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update category", error.message));
    }
  }

  async deleteCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await categoryService.deleteCategory(id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to delete category", error.message));
    }
  }

  async getCategoryTree(req: Request, res: Response): Promise<Response> {
    try {
      const result = await categoryService.getCategoryTree();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get category tree", error.message));
    }
  }

  async getCategoryProducts(req: Request, res: Response): Promise<Response> {
    try {
      // Fix: Handle string or string[] for slug
      const slug = Array.isArray(req.params.slug)
        ? req.params.slug[0]
        : req.params.slug;
      const { page = 1, limit = 12 } = req.query;

      const result = await categoryService.getCategoryProducts(
        slug,
        parseInt(page as string),
        parseInt(limit as string),
      );

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get category products", error.message));
    }
  }
}
