import { CreateProductInput, UpdateProductInput, ProductQueryParams } from "./product.interface";
import { ApiResponse } from "../../shared/types";
export declare class ProductService {
    createProduct(data: CreateProductInput): Promise<ApiResponse>;
    getProducts(params: ProductQueryParams): Promise<ApiResponse>;
    getProductBySlug(slug: string): Promise<ApiResponse>;
    getProductById(id: string): Promise<ApiResponse>;
    updateProduct(id: string, data: UpdateProductInput): Promise<ApiResponse>;
    deleteProduct(id: string): Promise<ApiResponse>;
    uploadProductImages(productId: string, images: string[]): Promise<ApiResponse>;
    removeProductImage(productId: string, imageUrl: string): Promise<ApiResponse>;
    getRelatedProducts(productId: string, limit?: number): Promise<ApiResponse>;
    getFeaturedProducts(limit?: number): Promise<ApiResponse>;
    toggleFavorite(userId: string, productId: string): Promise<ApiResponse>;
    getUserFavorites(userId: string, page?: number, limit?: number): Promise<ApiResponse>;
    getProductStats(): Promise<ApiResponse>;
}
//# sourceMappingURL=product.service.d.ts.map