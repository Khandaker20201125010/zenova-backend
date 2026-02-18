export interface CreateBlogPostInput {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    category?: string;
    tags: string[];
    isPublished?: boolean;
    publishedAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
export interface UpdateBlogPostInput {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
export interface BlogQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    authorId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=blog.interface.d.ts.map