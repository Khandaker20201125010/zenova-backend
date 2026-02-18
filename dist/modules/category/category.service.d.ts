import { ApiResponse } from "../../shared/types";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.interface";
export declare class CategoryService {
    createCategory(data: CreateCategoryInput): Promise<ApiResponse>;
    getCategories(includeProducts?: boolean): Promise<ApiResponse>;
    getCategoryBySlug(slug: string): Promise<ApiResponse>;
    updateCategory(id: string, data: UpdateCategoryInput): Promise<ApiResponse>;
    deleteCategory(id: string): Promise<ApiResponse>;
    getCategoryTree(): Promise<ApiResponse>;
    getCategoryProducts(slug: string, page?: number, limit?: number): Promise<ApiResponse>;
}
//# sourceMappingURL=category.service.d.ts.map