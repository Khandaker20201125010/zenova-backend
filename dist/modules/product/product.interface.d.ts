export interface CreateProductInput {
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    discountedPrice?: number;
    categoryId: string;
    tags: string[];
    features: string[];
    specifications: Record<string, any>;
    stock: number;
    isFeatured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
export interface UpdateProductInput {
    name?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    discountedPrice?: number;
    categoryId?: string;
    tags?: string[];
    features?: string[];
    specifications?: Record<string, any>;
    stock?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    isFeatured?: boolean;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=product.interface.d.ts.map