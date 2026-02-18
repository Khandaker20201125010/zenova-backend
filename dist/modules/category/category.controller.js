"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const http_status_codes_1 = require("http-status-codes");
const category_service_1 = require("./category.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const categoryService = new category_service_1.CategoryService();
class CategoryController {
    async createCategory(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await categoryService.createCategory(req.body);
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create category", error.message));
        }
    }
    async getCategories(req, res) {
        try {
            const { includeProducts } = req.query;
            const result = await categoryService.getCategories(includeProducts === "true");
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get categories", error.message));
        }
    }
    async getCategoryBySlug(req, res) {
        try {
            // Fix: Handle string or string[] for slug
            const slug = Array.isArray(req.params.slug)
                ? req.params.slug[0]
                : req.params.slug;
            const result = await categoryService.getCategoryBySlug(slug);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get category", error.message));
        }
    }
    async updateCategory(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await categoryService.updateCategory(id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update category", error.message));
        }
    }
    async deleteCategory(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await categoryService.deleteCategory(id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete category", error.message));
        }
    }
    async getCategoryTree(req, res) {
        try {
            const result = await categoryService.getCategoryTree();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get category tree", error.message));
        }
    }
    async getCategoryProducts(req, res) {
        try {
            // Fix: Handle string or string[] for slug
            const slug = Array.isArray(req.params.slug)
                ? req.params.slug[0]
                : req.params.slug;
            const { page = 1, limit = 12 } = req.query;
            const result = await categoryService.getCategoryProducts(slug, parseInt(page), parseInt(limit));
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get category products", error.message));
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=category.controller.js.map