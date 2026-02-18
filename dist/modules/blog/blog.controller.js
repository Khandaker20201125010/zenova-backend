"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const http_status_codes_1 = require("http-status-codes");
const blog_service_1 = require("./blog.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const blogService = new blog_service_1.BlogService();
class BlogController {
    async createPost(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await blogService.createPost(req.user.id, req.body);
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create blog post", error.message));
        }
    }
    async getPosts(req, res) {
        try {
            const result = await blogService.getPosts(req.query);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get blog posts", error.message));
        }
    }
    async getPostBySlug(req, res) {
        try {
            // Fix: Handle string or string[] for slug
            const slug = Array.isArray(req.params.slug)
                ? req.params.slug[0]
                : req.params.slug;
            const result = await blogService.getPostBySlug(slug);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get blog post", error.message));
        }
    }
    async getPostById(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await blogService.getPostById(id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get blog post", error.message));
        }
    }
    async updatePost(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await blogService.updatePost(id, req.user.id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update blog post", error.message));
        }
    }
    async deletePost(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await blogService.deletePost(id, req.user.id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete blog post", error.message));
        }
    }
    async getFeaturedPosts(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const result = await blogService.getFeaturedPosts(limit);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get featured posts", error.message));
        }
    }
    async getRecentPosts(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const result = await blogService.getRecentPosts(limit);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get recent posts", error.message));
        }
    }
    async getCategories(req, res) {
        try {
            const result = await blogService.getCategories();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get categories", error.message));
        }
    }
    async getTags(req, res) {
        try {
            const result = await blogService.getTags();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get tags", error.message));
        }
    }
    async getBlogStats(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await blogService.getBlogStats();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get blog stats", error.message));
        }
    }
    async uploadCoverImage(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            if (!req.file) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorResponse)("No file uploaded"));
            }
            const imageUrl = req.file.secure_url;
            return res
                .status(http_status_codes_1.StatusCodes.OK)
                .json((0, apiResponse_1.successResponse)("Image uploaded successfully", { url: imageUrl }));
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to upload image", error.message));
        }
    }
}
exports.BlogController = BlogController;
//# sourceMappingURL=blog.controller.js.map