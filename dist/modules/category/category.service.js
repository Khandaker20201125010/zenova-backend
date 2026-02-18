"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
class CategoryService {
    async createCategory(data) {
        try {
            // Generate slug from name
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            // Check if slug exists
            const existingCategory = await prisma_1.prisma.category.findUnique({
                where: { slug },
            });
            if (existingCategory) {
                return {
                    success: false,
                    message: "Category with this name already exists",
                };
            }
            const category = await prisma_1.prisma.category.create({
                data: {
                    ...data,
                    slug,
                },
            });
            return {
                success: true,
                message: "Category created successfully",
                data: category,
            };
        }
        catch (error) {
            logger_1.default.error("Create category error:", error);
            throw error;
        }
    }
    async getCategories(includeProducts = false) {
        try {
            const categories = await prisma_1.prisma.category.findMany({
                include: {
                    _count: {
                        select: {
                            products: true,
                            children: true,
                        },
                    },
                    children: includeProducts
                        ? {
                            include: {
                                _count: {
                                    select: {
                                        products: true,
                                    },
                                },
                            },
                        }
                        : false,
                    products: includeProducts
                        ? {
                            take: 5,
                            orderBy: { createdAt: "desc" },
                        }
                        : false,
                },
                orderBy: { name: "asc" },
            });
            return {
                success: true,
                message: "Categories retrieved successfully",
                data: categories,
            };
        }
        catch (error) {
            logger_1.default.error("Get categories error:", error);
            throw error;
        }
    }
    async getCategoryBySlug(slug) {
        try {
            const category = await prisma_1.prisma.category.findUnique({
                where: { slug },
                include: {
                    parent: true,
                    children: {
                        include: {
                            _count: {
                                select: {
                                    products: true,
                                },
                            },
                        },
                    },
                    products: {
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
                        orderBy: { createdAt: "desc" },
                    },
                    _count: {
                        select: {
                            products: true,
                            children: true,
                        },
                    },
                },
            });
            if (!category) {
                return {
                    success: false,
                    message: "Category not found",
                };
            }
            return {
                success: true,
                message: "Category retrieved successfully",
                data: category,
            };
        }
        catch (error) {
            logger_1.default.error("Get category by slug error:", error);
            throw error;
        }
    }
    async updateCategory(id, data) {
        try {
            const category = await prisma_1.prisma.category.findUnique({
                where: { id },
            });
            if (!category) {
                return {
                    success: false,
                    message: "Category not found",
                };
            }
            // If name is updated, update slug
            let updateData = data;
            if (data.name && data.name !== category.name) {
                const slug = data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                // Check if new slug exists
                const existingCategory = await prisma_1.prisma.category.findUnique({
                    where: { slug },
                });
                if (existingCategory && existingCategory.id !== id) {
                    return {
                        success: false,
                        message: "Category with this name already exists",
                    };
                }
                updateData.slug = slug;
            }
            const updatedCategory = await prisma_1.prisma.category.update({
                where: { id },
                data: updateData,
            });
            return {
                success: true,
                message: "Category updated successfully",
                data: updatedCategory,
            };
        }
        catch (error) {
            logger_1.default.error("Update category error:", error);
            throw error;
        }
    }
    async deleteCategory(id) {
        try {
            const category = await prisma_1.prisma.category.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            products: true,
                            children: true,
                        },
                    },
                },
            });
            if (!category) {
                return {
                    success: false,
                    message: "Category not found",
                };
            }
            // Check if category has products or children
            if (category._count.products > 0 || category._count.children > 0) {
                return {
                    success: false,
                    message: "Cannot delete category with products or subcategories",
                };
            }
            await prisma_1.prisma.category.delete({
                where: { id },
            });
            return {
                success: true,
                message: "Category deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete category error:", error);
            throw error;
        }
    }
    async getCategoryTree() {
        try {
            const categories = await prisma_1.prisma.category.findMany({
                include: {
                    children: {
                        include: {
                            children: true,
                        },
                    },
                },
                where: {
                    parentId: null,
                },
                orderBy: { name: "asc" },
            });
            return {
                success: true,
                message: "Category tree retrieved successfully",
                data: categories,
            };
        }
        catch (error) {
            logger_1.default.error("Get category tree error:", error);
            throw error;
        }
    }
    async getCategoryProducts(slug, page = 1, limit = 12) {
        try {
            const skip = (page - 1) * limit;
            const category = await prisma_1.prisma.category.findUnique({
                where: { slug },
            });
            if (!category) {
                return {
                    success: false,
                    message: "Category not found",
                };
            }
            // Get category and all subcategories
            const subcategories = await prisma_1.prisma.category.findMany({
                where: {
                    OR: [{ id: category.id }, { parentId: category.id }],
                },
                select: { id: true },
            });
            const categoryIds = subcategories.map((cat) => cat.id);
            const [products, total] = await Promise.all([
                prisma_1.prisma.product.findMany({
                    where: {
                        categoryId: { in: categoryIds },
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
                        _count: {
                            select: {
                                reviews: true,
                                favorites: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.product.count({
                    where: {
                        categoryId: { in: categoryIds },
                        isActive: true,
                    },
                }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Category products retrieved successfully",
                data: {
                    category,
                    products,
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
            logger_1.default.error("Get category products error:", error);
            throw error;
        }
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map