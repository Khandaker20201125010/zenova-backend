"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = require("../../shared/helpers/prisma");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
class ReviewService {
    async createReview(userId, productId, rating, comment) {
        try {
            // Check if user has purchased the product
            const hasPurchased = await prisma_1.prisma.order.findFirst({
                where: {
                    userId,
                    paymentStatus: "PAID",
                    orderItems: {
                        some: {
                            productId,
                        },
                    },
                },
            });
            if (!hasPurchased) {
                return {
                    success: false,
                    message: "You must purchase the product before leaving a review",
                };
            }
            // Check if user already reviewed this product - FIXED
            const existingReview = await prisma_1.prisma.review.findFirst({
                where: {
                    userId,
                    productId,
                },
            });
            if (existingReview) {
                return {
                    success: false,
                    message: "You have already reviewed this product",
                };
            }
            const review = await prisma_1.prisma.$transaction(async (tx) => {
                // Create review
                const newReview = await tx.review.create({
                    data: {
                        userId,
                        productId,
                        rating,
                        comment,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                });
                // Update product rating
                const productReviews = await tx.review.findMany({
                    where: { productId },
                    select: { rating: true },
                });
                const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) /
                    productReviews.length;
                await tx.product.update({
                    where: { id: productId },
                    data: {
                        rating: averageRating,
                        reviewCount: productReviews.length,
                    },
                });
                return newReview;
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId,
                    action: "CREATE_REVIEW",
                    entity: "REVIEW",
                    entityId: review.id,
                    details: {
                        productId,
                        rating,
                    },
                },
            });
            return {
                success: true,
                message: "Review created successfully",
                data: review,
            };
        }
        catch (error) {
            logger_1.default.error("Create review error:", error);
            throw error;
        }
    }
    async getProductReviews(productId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [reviews, total] = await Promise.all([
                prisma_1.prisma.review.findMany({
                    where: { productId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.review.count({ where: { productId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            // Get rating distribution
            const ratingDistribution = await prisma_1.prisma.review.groupBy({
                by: ["rating"],
                where: { productId },
                _count: {
                    rating: true,
                },
                orderBy: { rating: "desc" },
            });
            return {
                success: true,
                message: "Product reviews retrieved successfully",
                data: {
                    reviews,
                    ratingDistribution,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages,
                    },
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get product reviews error:", error);
            throw error;
        }
    }
    async getUserReviews(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [reviews, total] = await Promise.all([
                prisma_1.prisma.review.findMany({
                    where: { userId },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                slug: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.review.count({ where: { userId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "User reviews retrieved successfully",
                data: reviews,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get user reviews error:", error);
            throw error;
        }
    }
    async updateReview(id, userId, data) {
        try {
            const review = await prisma_1.prisma.review.findUnique({
                where: { id },
            });
            if (!review) {
                return {
                    success: false,
                    message: "Review not found",
                };
            }
            if (review.userId !== userId) {
                return {
                    success: false,
                    message: "Not authorized to update this review",
                };
            }
            const updatedReview = await prisma_1.prisma.$transaction(async (tx) => {
                const updated = await tx.review.update({
                    where: { id },
                    data,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                });
                // Update product rating if rating changed
                if (data.rating !== undefined) {
                    const productReviews = await tx.review.findMany({
                        where: { productId: review.productId },
                        select: { rating: true },
                    });
                    const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) /
                        productReviews.length;
                    await tx.product.update({
                        where: { id: review.productId },
                        data: {
                            rating: averageRating,
                        },
                    });
                }
                return updated;
            });
            return {
                success: true,
                message: "Review updated successfully",
                data: updatedReview,
            };
        }
        catch (error) {
            logger_1.default.error("Update review error:", error);
            throw error;
        }
    }
    async deleteReview(id, userId) {
        try {
            const review = await prisma_1.prisma.review.findUnique({
                where: { id },
            });
            if (!review) {
                return {
                    success: false,
                    message: "Review not found",
                };
            }
            if (review.userId !== userId) {
                return {
                    success: false,
                    message: "Not authorized to delete this review",
                };
            }
            await prisma_1.prisma.$transaction(async (tx) => {
                await tx.review.delete({
                    where: { id },
                });
                // Update product rating
                const productReviews = await tx.review.findMany({
                    where: { productId: review.productId },
                    select: { rating: true },
                });
                const averageRating = productReviews.length > 0
                    ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
                        productReviews.length
                    : 0;
                await tx.product.update({
                    where: { id: review.productId },
                    data: {
                        rating: averageRating,
                        reviewCount: productReviews.length,
                    },
                });
            });
            return {
                success: true,
                message: "Review deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete review error:", error);
            throw error;
        }
    }
    async getRecentReviews(limit = 5) {
        try {
            const reviews = await prisma_1.prisma.review.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                            slug: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: "Recent reviews retrieved successfully",
                data: reviews,
            };
        }
        catch (error) {
            logger_1.default.error("Get recent reviews error:", error);
            throw error;
        }
    }
    async getReviewStats() {
        try {
            const [totalReviews, averageRating, ratingDistribution, recentReviews, topReviewedProducts,] = await Promise.all([
                prisma_1.prisma.review.count(),
                prisma_1.prisma.review.aggregate({
                    _avg: { rating: true },
                }),
                prisma_1.prisma.review.groupBy({
                    by: ["rating"],
                    _count: {
                        rating: true,
                    },
                    orderBy: { rating: "desc" },
                }),
                prisma_1.prisma.review.findMany({
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.product.findMany({
                    take: 5,
                    orderBy: { reviewCount: "desc" },
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        reviewCount: true,
                    },
                }),
            ]);
            const stats = {
                totalReviews,
                averageRating: averageRating._avg.rating || 0,
                ratingDistribution,
                recentReviews,
                topReviewedProducts,
            };
            return {
                success: true,
                message: "Review stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            logger_1.default.error("Get review stats error:", error);
            throw error;
        }
    }
    // Add this method for the getAllReviews functionality
    async getAllReviews(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [reviews, total] = await Promise.all([
                prisma_1.prisma.review.findMany({
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.review.count(),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "All reviews retrieved successfully",
                data: reviews,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get all reviews error:", error);
            throw error;
        }
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=review.service.js.map