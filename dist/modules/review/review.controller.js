"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const http_status_codes_1 = require("http-status-codes");
const review_service_1 = require("./review.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const reviewService = new review_service_1.ReviewService();
class ReviewController {
    async createReview(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const { productId, rating, comment } = req.body;
            const result = await reviewService.createReview(req.user.id, productId, rating, comment);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create review", error.message));
        }
    }
    async getProductReviews(req, res) {
        try {
            // Fix: Handle string or string[] for productId
            const productId = Array.isArray(req.params.productId)
                ? req.params.productId[0]
                : req.params.productId;
            const { page = 1, limit = 10 } = req.query;
            const result = await reviewService.getProductReviews(productId, parseInt(page), parseInt(limit));
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get product reviews", error.message));
        }
    }
    async getUserReviews(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const { page = 1, limit = 10 } = req.query;
            const result = await reviewService.getUserReviews(req.user.id, parseInt(page), parseInt(limit));
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user reviews", error.message));
        }
    }
    async updateReview(req, res) {
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
            const result = await reviewService.updateReview(id, req.user.id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update review", error.message));
        }
    }
    async deleteReview(req, res) {
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
            const result = await reviewService.deleteReview(id, req.user.id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete review", error.message));
        }
    }
    async getRecentReviews(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const result = await reviewService.getRecentReviews(limit);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get recent reviews", error.message));
        }
    }
    async getReviewStats(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await reviewService.getReviewStats();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get review stats", error.message));
        }
    }
    async getAllReviews(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { page = 1, limit = 20 } = req.query;
            const result = await reviewService.getAllReviews(parseInt(page), parseInt(limit));
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get all reviews", error.message));
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=review.controller.js.map