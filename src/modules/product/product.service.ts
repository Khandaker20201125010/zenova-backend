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
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingProduct = await prisma.product.findUnique({
        where: { slug },
      });

      let finalSlug = slug;
      let finalName = data.name;

      if (existingProduct) {
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
      logger.error("Create product error:", error);
      return {
        success: false,
        message: "Failed to create product",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getProducts(params: ProductQueryParams): Promise<ApiResponse> {
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params.limit) || 12));
      const skip = (page - 1) * limit;

      const isFeatured = params.isFeatured === true;
      
      let inStockFilter = false;
      if (params.inStock !== undefined) {
        if (typeof params.inStock === 'string') {
          inStockFilter = params.inStock === 'true';
        } else {
          inStockFilter = params.inStock === true;
        }
      }

      const where: any = {
        isActive: true,
      };

      if (params.search) {
        where.OR = [
          { name: { contains: params.search, mode: "insensitive" } },
          { description: { contains: params.search, mode: "insensitive" } },
          { shortDescription: { contains: params.search, mode: "insensitive" } },
        ];
      }

      if (params.category) {
        where.categoryId = params.category;
      }

      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        where.price = {};
        if (params.minPrice !== undefined) {
          where.price.gte = Number(params.minPrice);
        }
        if (params.maxPrice !== undefined) {
          where.price.lte = Number(params.maxPrice);
        }
      }

      if (params.tags) {
        let tagArray: string[] = [];
        
        if (Array.isArray(params.tags)) {
          tagArray = params.tags;
        } else if (typeof params.tags === 'string') {
          tagArray = params.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }
        
        if (tagArray.length > 0) {
          where.tags = { hasSome: tagArray };
        }
      }

      if (params.isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }

      if (params.inStock !== undefined) {
        if (inStockFilter) {
          where.stock = { gt: 0 };
        } else {
          where.stock = { equals: 0 };
        }
      }

      const allowedSortFields = ['price', 'rating', 'createdAt', 'name', 'updatedAt'];
      const sortBy = allowedSortFields.includes(params.sortBy || '') 
        ? params.sortBy 
        : 'createdAt';
      
      const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

      let products;
      let total;
      
      try {
        [products, total] = await Promise.all([
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
            orderBy: { [sortBy!]: sortOrder },
          }),
          prisma.product.count({ where }),
        ]);
      } catch (dbError: any) {
        logger.error("Database error in getProducts:", dbError);
        return {
          success: false,
          message: "Database error while fetching products",
          error: dbError?.message || "Unknown database error",
        };
      }

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
      logger.error("Get products error:", error);
      return {
        success: false,
        message: "Failed to get products",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Get product by slug error:", error);
      return {
        success: false,
        message: "Failed to get product",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Get product by ID error:", error);
      return {
        success: false,
        message: "Failed to get product",
        error: error?.message || "Unknown error",
      };
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

    // Clean up data - remove undefined/null values
    const updateData: any = { ...data };
    
    // Convert empty strings to null for optional fields
    if (updateData.shortDescription === "") updateData.shortDescription = null;
    if (updateData.discountedPrice === null || updateData.discountedPrice === "") delete updateData.discountedPrice;
    if (updateData.seoTitle === null || updateData.seoTitle === "") updateData.seoTitle = null;
    if (updateData.seoDescription === null || updateData.seoDescription === "") updateData.seoDescription = null;
    
    // Handle slug update if name changes
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
    logger.error("Update product error:", error);
    return {
      success: false,
      message: "Failed to update product",
      error: error?.message || "Unknown error",
    };
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

      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error: any) {
      logger.error("Delete product error:", error);
      return {
        success: false,
        message: "Failed to delete product",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Upload product images error:", error);
      return {
        success: false,
        message: "Failed to upload images",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Remove product image error:", error);
      return {
        success: false,
        message: "Failed to remove image",
        error: error?.message || "Unknown error",
      };
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
            { tags: { hasSome: product.tags || [] } },
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
      logger.error("Get related products error:", error);
      return {
        success: false,
        message: "Failed to get related products",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Get featured products error:", error);
      return {
        success: false,
        message: "Failed to get featured products",
        error: error?.message || "Unknown error",
      };
    }
  }

  async toggleFavorite(
    userId: string,
    productId: string,
  ): Promise<ApiResponse> {
    try {
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingFavorite) {
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
      logger.error("Toggle favorite error:", error);
      return {
        success: false,
        message: "Failed to toggle favorite",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Get user favorites error:", error);
      return {
        success: false,
        message: "Failed to get favorites",
        error: error?.message || "Unknown error",
      };
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
      logger.error("Get product stats error:", error);
      return {
        success: false,
        message: "Failed to get product stats",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getAllTags(): Promise<ApiResponse> {
    try {
      const products = await prisma.product.findMany({
        where: { 
          isActive: true,
        },
        select: { 
          tags: true,
        },
      });
      
      const allTags = products
        .flatMap(p => p.tags || [])
        .filter(tag => tag && tag.trim() !== '');

      const uniqueTags = [...new Set(allTags)].sort();

      return {
        success: true,
        message: "Tags retrieved successfully",
        data: uniqueTags,
      };
    } catch (error: any) {
      logger.error("Get all tags error:", error);
      return {
        success: false,
        message: "Failed to get tags",
        error: error?.message || "Unknown error",
      };
    }
  }
}