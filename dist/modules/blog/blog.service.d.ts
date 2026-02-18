import { ApiResponse } from "../../shared/types";
import { CreateBlogPostInput, UpdateBlogPostInput, BlogQueryParams } from "./blog.interface";
export declare class BlogService {
    createPost(userId: string, data: CreateBlogPostInput): Promise<ApiResponse>;
    getPosts(params: BlogQueryParams): Promise<ApiResponse>;
    getPostBySlug(slug: string): Promise<ApiResponse>;
    getPostById(id: string): Promise<ApiResponse>;
    updatePost(id: string, userId: string, data: UpdateBlogPostInput): Promise<ApiResponse>;
    deletePost(id: string, userId: string): Promise<ApiResponse>;
    getFeaturedPosts(limit?: number): Promise<ApiResponse>;
    getRecentPosts(limit?: number): Promise<ApiResponse>;
    getCategories(): Promise<ApiResponse>;
    getTags(): Promise<ApiResponse>;
    getBlogStats(): Promise<ApiResponse>;
}
//# sourceMappingURL=blog.service.d.ts.map