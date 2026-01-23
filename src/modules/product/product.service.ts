import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
} from "./product.interface";
import { ApiResponse } from "../../shared/types";
import { prisma } from "../../shared/helpers/prisma";
import logger from "../../shared/helpers/logger";

export class ProductService {
  async createProduct(data: CreateProductInput): Promise<ApiResponse> {
    try {
      // Generate slug from name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug },
      });

      let finalSlug = slug;
      let finalName = data.name;

      if (existingProduct) {
        // Add timestamp to make slug unique
        finalSlug = `${slug}-${Date.now()}`;
        finalName = `${data.name} (${new Date().toLocaleDateString()})`;
      }

      const product = await prisma.product.create({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Create product error:", error);
      throw error;
    }
  }

  async getProducts(params: ProductQueryParams): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        category,
        minPrice,
        maxPrice,
        tags,
        isFeatured,
        inStock,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
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
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
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
        } else {
          where.stock = { equals: 0 };
        }
      }

      // Get products
      const [products, total] = await Promise.all([
        prisma.product.findMany({
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
        prisma.product.count({ where }),
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get products error:", error);
      throw error;
    }
  }

  async getProductBySlug(slug: string): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get product by slug error:", error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get product by ID error:", error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductInput,
  ): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // If name is updated, update slug
      let updateData: any = { ...data };
      if (data.name && data.name !== product.name) {
        const slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        updateData.slug = `${slug}-${Date.now()}`;
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Update product error:", error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Soft delete by setting inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Delete product error:", error);
      throw error;
    }
  }

  async uploadProductImages(
    productId: string,
    images: string[],
  ): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      const currentImages = (product.images as string[]) || [];
      const updatedImages = [...currentImages, ...images];

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      });

      return {
        success: true,
        message: "Images uploaded successfully",
        data: updatedProduct,
      };
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Upload product images error:", error);
      throw error;
    }
  }

  async removeProductImage(
    productId: string,
    imageUrl: string,
  ): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      const currentImages = (product.images as string[]) || [];
      const updatedImages = currentImages.filter((img) => img !== imageUrl);

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      });

      return {
        success: true,
        message: "Image removed successfully",
        data: updatedProduct,
      };
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Remove product image error:", error);
      throw error;
    }
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<ApiResponse> {
    try {
      const product = await prisma.product.findUnique({
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

      const relatedProducts = await prisma.product.findMany({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get related products error:", error);
      throw error;
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse> {
    try {
      const products = await prisma.product.findMany({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get featured products error:", error);
      throw error;
    }
  }

  async toggleFavorite(
    userId: string,
    productId: string,
  ): Promise<ApiResponse> {
    try {
      // Check if already favorited
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingFavorite) {
        // Remove from favorites
        await prisma.favorite.delete({
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
      } else {
        // Add to favorites
        await prisma.favorite.create({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Toggle favorite error:", error);
      throw error;
    }
  }

  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<ApiResponse> {
    try {
      const skip = (page - 1) * limit;

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
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
        prisma.favorite.count({ where: { userId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Favorites retrieved successfully",
        data: favorites.map((fav: any) => fav.product),
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get user favorites error:", error);
      throw error;
    }
  }

  async getProductStats(): Promise<ApiResponse> {
    try {
      const [
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        averagePrice,
        totalStock,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.category.count(),
        prisma.product.aggregate({
          _avg: { price: true },
        }),
        prisma.product.aggregate({
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
    } catch (error: any) {
      // Fix: Add type annotation
      logger.error("Get product stats error:", error);
      throw error;
    }
  }
}
