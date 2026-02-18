"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../../shared/helpers/prisma");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
class ProductService {
    async createProduct(data) {
        try {
            // Generate slug from name
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            // Check if slug exists
            const existingProduct = await prisma_1.prisma.product.findUnique({
                where: { slug },
            });
            let finalSlug = slug;
            let finalName = data.name;
            if (existingProduct) {
                // Add timestamp to make slug unique
                finalSlug = `${slug}-${Date.now()}`;
                finalName = `${data.name} (${new Date().toLocaleDateString()})`;
            }
            const product = await prisma_1.prisma.product.create({
                data: {
                    ...data,
                    name: finalName,
                    slug: finalSlug,
                    images: [],
                    specifications: data.specifications || {},
                    features: data.features || [],
                    seoKeywords: data.seoKeywords || [],
                },
            });
            return {
                success: true,
                message: "Product created successfully",
                data: product,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Create product error:", error);
            throw error;
        }
    }
    async getProducts(params) {
        try {
            const { page = 1, limit = 12, search, category, minPrice, maxPrice, tags, isFeatured, inStock, sortBy = "createdAt", sortOrder = "desc", } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {
                isActive: true,
            };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { shortDescription: { contains: search, mode: "insensitive" } },
                ];
            }
            if (category) {
                where.categoryId = category;
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {};
                if (minPrice !== undefined)
                    where.price.gte = minPrice;
                if (maxPrice !== undefined)
                    where.price.lte = maxPrice;
            }
            if (tags && tags.length > 0) {
                where.tags = { hasSome: tags };
            }
            if (isFeatured !== undefined) {
                where.isFeatured = isFeatured;
            }
            if (inStock !== undefined) {
                if (inStock) {
                    where.stock = { gt: 0 };
                }
                else {
                    where.stock = { equals: 0 };
                }
            }
            // Get products
            const [products, total] = await Promise.all([
                prisma_1.prisma.product.findMany({
                    where,
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        _count: {
                            select: {
                                reviews: true,
                                favorites: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                }),
                prisma_1.prisma.product.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Products retrieved successfully",
                data: products,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get products error:", error);
            throw error;
        }
    }
    async getProductBySlug(slug) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { slug },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                    _count: {
                        select: {
                            reviews: true,
                            favorites: true,
                        },
                    },
                },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            return {
                success: true,
                message: "Product retrieved successfully",
                data: product,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get product by slug error:", error);
            throw error;
        }
    }
    async getProductById(id) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            return {
                success: true,
                message: "Product retrieved successfully",
                data: product,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get product by ID error:", error);
            throw error;
        }
    }
    async updateProduct(id, data) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            // If name is updated, update slug
            let updateData = { ...data };
            if (data.name && data.name !== product.name) {
                const slug = data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                updateData.slug = `${slug}-${Date.now()}`;
            }
            const updatedProduct = await prisma_1.prisma.product.update({
                where: { id },
                data: updateData,
            });
            return {
                success: true,
                message: "Product updated successfully",
                data: updatedProduct,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Update product error:", error);
            throw error;
        }
    }
    async deleteProduct(id) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            // Soft delete by setting inactive
            await prisma_1.prisma.product.update({
                where: { id },
                data: { isActive: false },
            });
            return {
                success: true,
                message: "Product deleted successfully",
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Delete product error:", error);
            throw error;
        }
    }
    async uploadProductImages(productId, images) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            const currentImages = product.images || [];
            const updatedImages = [...currentImages, ...images];
            const updatedProduct = await prisma_1.prisma.product.update({
                where: { id: productId },
                data: { images: updatedImages },
            });
            return {
                success: true,
                message: "Images uploaded successfully",
                data: updatedProduct,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Upload product images error:", error);
            throw error;
        }
    }
    async removeProductImage(productId, imageUrl) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            const currentImages = product.images || [];
            const updatedImages = currentImages.filter((img) => img !== imageUrl);
            const updatedProduct = await prisma_1.prisma.product.update({
                where: { id: productId },
                data: { images: updatedImages },
            });
            return {
                success: true,
                message: "Image removed successfully",
                data: updatedProduct,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Remove product image error:", error);
            throw error;
        }
    }
    async getRelatedProducts(productId, limit = 4) {
        try {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: productId },
                select: {
                    categoryId: true,
                    tags: true,
                },
            });
            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                };
            }
            const relatedProducts = await prisma_1.prisma.product.findMany({
                where: {
                    id: { not: productId },
                    OR: [
                        { categoryId: product.categoryId },
                        { tags: { hasSome: product.tags } },
                    ],
                    isActive: true,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
                take: limit,
                orderBy: { rating: "desc" },
            });
            return {
                success: true,
                message: "Related products retrieved successfully",
                data: relatedProducts,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get related products error:", error);
            throw error;
        }
    }
    async getFeaturedProducts(limit = 8) {
        try {
            const products = await prisma_1.prisma.product.findMany({
                where: {
                    isFeatured: true,
                    isActive: true,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
                take: limit,
                orderBy: { createdAt: "desc" },
            });
            return {
                success: true,
                message: "Featured products retrieved successfully",
                data: products,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get featured products error:", error);
            throw error;
        }
    }
    async toggleFavorite(userId, productId) {
        try {
            // Check if already favorited
            const existingFavorite = await prisma_1.prisma.favorite.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            if (existingFavorite) {
                // Remove from favorites
                await prisma_1.prisma.favorite.delete({
                    where: {
                        userId_productId: {
                            userId,
                            productId,
                        },
                    },
                });
                return {
                    success: true,
                    message: "Removed from favorites",
                    data: { isFavorited: false },
                };
            }
            else {
                // Add to favorites
                await prisma_1.prisma.favorite.create({
                    data: {
                        userId,
                        productId,
                    },
                });
                return {
                    success: true,
                    message: "Added to favorites",
                    data: { isFavorited: true },
                };
            }
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Toggle favorite error:", error);
            throw error;
        }
    }
    async getUserFavorites(userId, page = 1, limit = 12) {
        try {
            const skip = (page - 1) * limit;
            const [favorites, total] = await Promise.all([
                prisma_1.prisma.favorite.findMany({
                    where: { userId },
                    include: {
                        product: {
                            include: {
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.favorite.count({ where: { userId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Favorites retrieved successfully",
                data: favorites.map((fav) => fav.product),
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get user favorites error:", error);
            throw error;
        }
    }
    async getProductStats() {
        try {
            const [totalProducts, activeProducts, outOfStockProducts, totalCategories, averagePrice, totalStock,] = await Promise.all([
                prisma_1.prisma.product.count(),
                prisma_1.prisma.product.count({ where: { isActive: true } }),
                prisma_1.prisma.product.count({ where: { stock: 0 } }),
                prisma_1.prisma.category.count(),
                prisma_1.prisma.product.aggregate({
                    _avg: { price: true },
                }),
                prisma_1.prisma.product.aggregate({
                    _sum: { stock: true },
                }),
            ]);
            const stats = {
                totalProducts,
                activeProducts,
                outOfStockProducts,
                totalCategories,
                averagePrice: averagePrice._avg.price || 0,
                totalStock: totalStock._sum.stock || 0,
            };
            return {
                success: true,
                message: "Product stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            // Fix: Add type annotation
            logger_1.default.error("Get product stats error:", error);
            throw error;
        }
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map